;;; ==========================================================================
;;;  CP.lsp -- coordinate callouts
;;; ==========================================================================
;;;  Built on the same insert-and-fill mechanism as GV_PLACE.lsp, which is
;;;  known to work. No drawing dictionaries, no vl-catch-all-apply -- only
;;;  things already proven in this drawing, plus one plain *error* handler
;;;  so that a failure says what it was instead of stopping in silence.
;;;
;;;  Commands
;;;    CPTOP   says the file started loading      (diagnostic)
;;;    CPEND   says the file finished loading     (diagnostic)
;;;    CPSTAT  show what CP is currently set to  (diagnostic)
;;;    CPCAL   learn the callout block from one you already have
;;;    CP      place a callout: Type / Pick / List
;;;    CPSET   change settings by hand
;;; ==========================================================================

(vl-load-com)

(defun c:CPTOP () (princ "\nCP.lsp: top of file reached.") (princ))

;; ---- so a failure reports itself -----------------------------------------
;; Bound locally by CP and CPCAL, so it is in force only while they run and
;; AutoCAD puts the normal handler back afterwards. It prints the message at
;; the command line, where it can be read without opening the text window,
;; then puts back anything the command had changed.

(defun cp:err (msg)
  (if (and msg
           (not (member msg '("Function cancelled" "quit / exit abort"))))
    (progn
      (princ "\n*** CP stopped: ")
      (princ msg)
      (princ "\n*** Send me that line exactly as it reads.")))
  (while (> (getvar "CMDACTIVE") 0) (command))
  (if *CP-OPEN*
    (progn (command "._UNDO" "_END") (setq *CP-OPEN* nil)))
  (if olde (setvar "ATTREQ"  olde))
  (if oldd (setvar "ATTDIA"  oldd))
  (if oldc (setvar "CMDECHO" oldc))
  (if oldo (setvar "OSMODE"  oldo))
  (princ))

;; ---- settings, plain globals ---------------------------------------------

(setq *CP-BLOCK* "COOR XY")   ; callout block name
(setq *CP-SCALE* 1.0)         ; insertion scale
(setq *CP-ROT*   0.0)         ; insertion rotation, degrees
(setq *CP-PREC*  3)           ; decimal places
(setq *CP-NPFX*  "N=")        ; wording in front of the northing
(setq *CP-EPFX*  "E=")        ; wording in front of the easting
(setq *CP-TAGON* 1)           ; 1 = write a tag above each callout, 0 = do not
(setq *CP-TAGLAY* "CP-TAG")   ; layer for that tag
(setq *CP-OFFE*  0.0)         ; drawing offset from the survey grid
(setq *CP-OFFN*  0.0)
(setq *CP-NEXT*  "P1")        ; next tag suggested
(setq *CP-OPEN*  nil)         ; T while an UNDO group is open

;; ---- reading numbers out of whatever the user types -----------------------

(defun cp:digitp (c) (and (>= (ascii c) 48) (<= (ascii c) 57)))

(defun cp:hasdigit (s / i found)
  (setq i 1 found nil)
  (while (and (<= i (strlen s)) (not found))
    (if (cp:digitp (substr s i 1)) (setq found T))
    (setq i (1+ i)))
  found)

(defun cp:nums (s / i n c cur out)
  (setq i 1 n (strlen s) cur "" out nil)
  (while (<= i (1+ n))
    (setq c (if (<= i n) (substr s i 1) " "))
    (if (or (cp:digitp c)
            (and (= c ".") (/= cur ""))
            (and (= c "-") (= cur "")))
      (setq cur (strcat cur c))
      (progn
        (if (and (/= cur "") (cp:hasdigit cur) (distof cur 2))
          (setq out (cons (distof cur 2) out)))
        (setq cur "")))
    (setq i (1+ i)))
  (reverse out))

(defun cp:after (s letter / up i n c out cur go)
  "The first number following LETTER in s."
  (setq up (strcase s) i 1 n (strlen s) out nil go nil cur "")
  (while (and (<= i n) (not out))
    (setq c (substr s i 1))
    (cond
      ((and (not go) (= (substr up i 1) letter)) (setq go T cur ""))
      (go
       (if (or (cp:digitp c) (and (= c ".") (/= cur "")) (and (= c "-") (= cur "")))
         (setq cur (strcat cur c))
         (if (/= cur "") (setq out (distof cur 2)))))
      (T nil))
    (setq i (1+ i)))
  (if (and (not out) (/= cur "") (cp:hasdigit cur)) (setq out (distof cur 2)))
  out)

(defun cp:other (lst v / x out)
  (setq out nil)
  (foreach x lst (if (and (null out) (not (equal x v 1e-9))) (setq out x)))
  out)

(defun cp:parse (s / nn ee lst)
  "Returns (northing easting), either possibly nil."
  (setq nn (cp:after s "N") ee (cp:after s "E") lst (cp:nums s))
  (cond
    ((and nn ee) (list nn ee))
    (nn (list nn (cp:other lst nn)))
    (ee (list (cp:other lst ee) ee))
    ((>= (length lst) 2) (list (car lst) (cadr lst)))
    ((= (length lst) 1) (list (car lst) nil))
    (T (list nil nil))))

(defun cp:bump (s / i digits head c)
  (setq i (strlen s) digits "")
  (while (and (> i 0) (cp:digitp (substr s i 1)))
    (setq digits (strcat (substr s i 1) digits) i (1- i)))
  (if (= digits "")
    s
    (progn
      (setq head (substr s 1 i) c (itoa (1+ (atoi digits))))
      (while (< (strlen c) (strlen digits)) (setq c (strcat "0" c)))
      (strcat head c))))

;; ---- placing --------------------------------------------------------------

(defun cp:attribs (e / out nx)
  (setq out nil nx (entnext e))
  (while (and nx (= "ATTRIB" (cdr (assoc 0 (entget nx)))))
    (setq out (cons nx out) nx (entnext nx)))
  (reverse out))

(defun cp:tagtext (obj tag / a d p best bx bh brot)
  (setq best nil bx nil bh 2.5 brot 0.0)
  (foreach a (cp:attribs obj)
    (setq d (entget a) p (cdr (assoc 10 d)))
    (if (or (null best) (> (cadr p) best))
      (setq best (cadr p) bx (car p)
            bh   (cond ((cdr (assoc 40 d))) (2.5))
            brot (cond ((cdr (assoc 50 d))) (0.0)))))
  (if best
    (progn
      (if (not (tblsearch "LAYER" *CP-TAGLAY*))
        (entmakex (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord")
                        '(100 . "AcDbLayerTableRecord") (cons 2 *CP-TAGLAY*)
                        '(70 . 0) '(62 . 7) (cons 6 "Continuous"))))
      (entmakex (list '(0 . "TEXT") '(100 . "AcDbEntity")
                      (cons 8 *CP-TAGLAY*) '(100 . "AcDbText")
                      (cons 10 (list bx (+ best (* 1.8 bh)) 0.0))
                      (cons 40 bh) (cons 1 tag) (cons 50 brot))))))

(defun cp:place (nn ee tag at / p ns es obj a d atag filled)
  (setq ns (strcat *CP-NPFX* (rtos nn 2 *CP-PREC*))
        es (strcat *CP-EPFX* (rtos ee 2 *CP-PREC*))
        filled 0)
  (setq p (if at
            (list (car at) (cadr at) 0.0)
            (list (+ ee *CP-OFFE*) (+ nn *CP-OFFN*) 0.0)))
  (command "._-INSERT" *CP-BLOCK* "_non" p *CP-SCALE* *CP-SCALE* *CP-ROT*)
  (setq obj (entlast))
  (if (= "INSERT" (cdr (assoc 0 (entget obj))))
    (progn
      (foreach a (cp:attribs obj)
        (setq d (entget a) atag (strcase (cdr (assoc 2 d))))
        (cond
          ((wcmatch atag "Y*,N*")
           (entmod (subst (cons 1 ns) (assoc 1 d) d)) (setq filled (1+ filled)))
          ((wcmatch atag "X*,E*")
           (entmod (subst (cons 1 es) (assoc 1 d) d)) (setq filled (1+ filled)))))
      (entupd obj)
      (if (and (= *CP-TAGON* 1) tag (/= tag "")) (cp:tagtext obj tag))))
  filled)

;; ---- calibration ----------------------------------------------------------

(defun cp:prefix (s / i c)
  (setq i 1)
  (while (and (<= i (strlen s))
              (setq c (substr s i 1))
              (not (or (= c "-") (cp:digitp c))))
    (setq i (1+ i)))
  (if (> i 1) (substr s 1 (1- i)) ""))

(defun cp:decimals (s / pos i n)
  (setq pos (vl-string-search "." s) n 0)
  (if pos
    (progn
      (setq i (+ pos 2))
      (while (and (<= i (strlen s)) (cp:digitp (substr s i 1)))
        (setq n (1+ n) i (1+ i)))))
  n)

(defun cp:ename (e / obj nm)
  (setq nm (cdr (assoc 2 (entget e))))
  (if (and nm (= "*" (substr nm 1 1)))
    (progn
      (setq obj (vlax-ename->vla-object e))
      (if (vlax-property-available-p obj 'EffectiveName)
        (setq nm (vla-get-EffectiveName obj)))))
  nm)

(defun c:CPCAL ( / *error* e d p atts a ad txt val nsam esam nn ee)
  (setq *error* cp:err)
  (princ "\nSelect one coordinate callout you already have: ")
  (setq e (car (entsel)))
  (if (or (not e) (/= "INSERT" (cdr (assoc 0 (entget e)))))
    (if e
      (princ (strcat "\nThat is a " (cdr (assoc 0 (entget e)))
                     ", not a block. Click the callout box itself."))
      (princ "\nNothing picked."))
    (progn
      (setq d (entget e) p (cdr (assoc 10 d)) atts (cp:attribs e))
      (if (null atts)
        (princ "\nThat block has no attributes, so there is nothing to learn.")
        (progn
          (setq *CP-BLOCK* (cp:ename e)
                *CP-SCALE* (cond ((cdr (assoc 41 d))) (1.0))
                *CP-ROT*   (/ (* 180.0 (cond ((cdr (assoc 50 d))) (0.0))) pi))
          (if (<= *CP-SCALE* 0.0) (setq *CP-SCALE* 1.0))
          (setq nsam nil esam nil)
          (foreach a atts
            (setq ad (entget a) txt (cdr (assoc 1 ad)) val (car (cp:nums txt)))
            (if val
              (progn
                (if (and (not nsam) (< (abs (- val (cadr p))) 0.5)) (setq nsam txt))
                (if (and (not esam) (< (abs (- val (car p))) 0.5)) (setq esam txt)))))
          (if (not nsam)
            (foreach a atts
              (setq ad (entget a))
              (if (and (not nsam) (wcmatch (strcase (cdr (assoc 2 ad))) "Y*,N*"))
                (setq nsam (cdr (assoc 1 ad))))))
          (if (not esam)
            (foreach a atts
              (setq ad (entget a))
              (if (and (not esam) (wcmatch (strcase (cdr (assoc 2 ad))) "X*,E*"))
                (setq esam (cdr (assoc 1 ad))))))
          (if nsam
            (setq *CP-NPFX* (cp:prefix nsam) *CP-PREC* (cp:decimals nsam)))
          (if esam (setq *CP-EPFX* (cp:prefix esam)))
          (setq nn (if nsam (car (cp:nums nsam)))
                ee (if esam (car (cp:nums esam))))
          (if (and nn ee)
            (setq *CP-OFFN* (- (cadr p) nn) *CP-OFFE* (- (car p) ee)))
          (princ "\n--- learned from that callout ---")
          (princ (strcat "\n  Block      " *CP-BLOCK*))
          (princ (strcat "\n  Scale      " (rtos *CP-SCALE* 2 6)
                         "   Rotation " (rtos *CP-ROT* 2 3)))
          (princ (strcat "\n  Northing   " *CP-NPFX* " to " (itoa *CP-PREC*)
                         " decimals" (if nsam (strcat "   e.g. " nsam) "")))
          (princ (strcat "\n  Easting    " *CP-EPFX*
                         (if esam (strcat "               e.g. " esam) "")))
          (if (and (equal *CP-OFFE* 0.0 0.001) (equal *CP-OFFN* 0.0 0.001))
            (princ "\n  Drawing    is on the survey grid")
            (princ (strcat "\n  Drawing    sits E" (rtos *CP-OFFE* 2 3)
                           " N" (rtos *CP-OFFN* 2 3) " from the survey grid")))
          (princ "\n\nRun CP to place callouts.")))))
  (princ))

;; ---- settings -------------------------------------------------------------

(defun cp:ask (label cur / s)
  (setq s (getstring T (strcat "\n  " label " <" cur ">: ")))
  (if (= s "") cur s))

(defun c:CPSET ( / s)
  (princ "\n--- CP settings (Enter keeps the value shown) ---")
  (setq *CP-BLOCK* (cp:ask "Callout block name" *CP-BLOCK*))
  (setq *CP-SCALE* (atof (cp:ask "Block scale" (rtos *CP-SCALE* 2 6))))
  (if (<= *CP-SCALE* 0.0) (setq *CP-SCALE* 1.0))
  (setq *CP-ROT*   (atof (cp:ask "Block rotation, degrees" (rtos *CP-ROT* 2 4))))
  (setq *CP-NPFX*  (cp:ask "Northing wording" *CP-NPFX*))
  (setq *CP-EPFX*  (cp:ask "Easting wording"  *CP-EPFX*))
  (setq *CP-PREC*  (atoi (cp:ask "Decimal places" (itoa *CP-PREC*))))
  (setq s (cp:ask "Tag above each callout (Y/N)" (if (= *CP-TAGON* 1) "Y" "N")))
  (setq *CP-TAGON* (if (= (strcase s) "Y") 1 0))
  (setq *CP-TAGLAY* (cp:ask "Layer for the tag" *CP-TAGLAY*))
  (setq *CP-NEXT*  (cp:ask "Next tag to suggest" *CP-NEXT*))
  (setq *CP-OFFE*  (atof (cp:ask "Drawing offset from grid, E" (rtos *CP-OFFE* 2 6))))
  (setq *CP-OFFN*  (atof (cp:ask "Drawing offset from grid, N" (rtos *CP-OFFN* 2 6))))
  (princ "\nSaved for this session.")
  (princ))

;; ---- the three ways to place ----------------------------------------------

(defun cp:asktag ( / s)
  (if (/= *CP-TAGON* 1)
    ""
    (progn
      (setq s (getstring T (strcat "\nTag <" *CP-NEXT* ">  (. for none): ")))
      (cond ((= s "") *CP-NEXT*) ((= s ".") "") (T s)))))

(defun cp:dotype ( / s pair nn ee tag at n go)
  (setq n 0 go T)
  (while go
    (setq s (getstring T (strcat "\nNorthing " *CP-NPFX*
                                 "  (paste both N and E if you like, . to stop): ")))
    (if (= s ".")
      (setq go nil)
      (progn
        (setq pair (cp:parse s) nn (car pair) ee (cadr pair))
        (if (not nn)
          (princ "\n  no number found there -- try again.")
          (progn
            (while (not ee)
              (setq s (getstring T (strcat "\nEasting " *CP-EPFX* ": ")))
              (setq ee (cp:after s "E"))
              (if (not ee) (setq ee (car (cp:nums s))))
              (if (not ee) (princ "\n  no number found there -- try again.")))
            (setq tag (cp:asktag))
            (setq at (getpoint "\nPick where the callout goes (Enter = on the coordinate): "))
            (if (> (cp:place nn ee tag at) 0)
              (progn
                (setq n (1+ n))
                (if (/= tag "") (setq *CP-NEXT* (cp:bump tag)))
                (princ (strcat "\n  placed " *CP-NPFX* (rtos nn 2 *CP-PREC*)
                               "  " *CP-EPFX* (rtos ee 2 *CP-PREC*))))
              (progn
                (princ "\n  the block went in but no attribute matched -- run CPCAL.")
                (setq go nil))))))))
  n)

(defun cp:dopick ( / p nn ee tag at n go)
  (setq n 0 go T)
  (while go
    (setq p (getpoint "\nPick the point to annotate (Enter to stop): "))
    (if (not p)
      (setq go nil)
      (progn
        (setq ee (- (car p) *CP-OFFE*) nn (- (cadr p) *CP-OFFN*))
        (princ (strcat "\n  " *CP-NPFX* (rtos nn 2 *CP-PREC*)
                       "   " *CP-EPFX* (rtos ee 2 *CP-PREC*)))
        (setq tag (cp:asktag))
        (setq at (getpoint p "\nPick where the callout goes (Enter = on the point): "))
        (if (not at) (setq at p))
        (if (> (cp:place nn ee tag at) 0)
          (progn
            (setq n (1+ n))
            (if (/= tag "") (setq *CP-NEXT* (cp:bump tag))))
          (progn
            (princ "\n  the block went in but no attribute matched -- run CPCAL.")
            (setq go nil))))))
  n)

(defun cp:split (line / out cur i ch inq)
  (setq out nil cur "" i 1 inq nil)
  (while (<= i (strlen line))
    (setq ch (substr line i 1))
    (cond ((= ch "\"") (setq inq (not inq)))
          ((and (= ch ",") (not inq)) (setq out (cons cur out) cur ""))
          (T (setq cur (strcat cur ch))))
    (setq i (1+ i)))
  (reverse (cons cur out)))

(defun cp:trim (s) (vl-string-trim " \t\r\n" s))

(defun cp:col (hdr pats / i idx h)
  (setq i 0 idx nil)
  (foreach h hdr
    (if (and (null idx) (wcmatch (strcase (cp:trim h)) pats)) (setq idx i))
    (setq i (1+ i)))
  idx)

(defun cp:dolist ( / path fh line cells first it ie inn n tag nn ee)
  (setq path (getfiled "Select the coordinate CSV" "" "csv" 16) n 0)
  (if path
    (progn
      (setq fh (open path "r") first T it 0 ie 1 inn 2)
      (if fh
        (progn
          (while (setq line (read-line fh))
            (setq cells (mapcar 'cp:trim (cp:split line)))
            (cond
              ((< (length cells) 3) nil)
              ((and first (not (cp:hasdigit (nth 1 cells))))
               (setq first nil
                     it  (cond ((cp:col cells "POINT*,NAME*,TAG*,ID*")) (0))
                     ie  (cond ((cp:col cells "EAST*,E,X"))  (1))
                     inn (cond ((cp:col cells "NORTH*,N,Y")) (2))))
              (T
               (setq first nil
                     ee (car (cp:nums (nth ie cells)))
                     nn (car (cp:nums (nth inn cells)))
                     tag (if (= *CP-TAGON* 1) (nth it cells) ""))
               (if (and ee nn)
                 (if (> (cp:place nn ee tag nil) 0) (setq n (1+ n)))))))
          (close fh))
        (princ "\nCould not open that file."))))
  n)

;; ---- CP -------------------------------------------------------------------

(defun c:CP ( / *error* mode n olde oldd oldc oldo)
  (setq *error* cp:err)
  ;; a missing block name is not a dead end -- ask which one to copy
  (if (not (tblsearch "BLOCK" *CP-BLOCK*))
    (progn
      (princ (strcat "\nNo block named \"" *CP-BLOCK* "\" in this drawing"
                     " -- let us find yours."))
      (c:CPCAL)))
  (if (not (tblsearch "BLOCK" *CP-BLOCK*))
    (princ "\nStill no callout block. Run CPCAL and click one of your callouts.")
    (progn
      (initget "Type Pick List Calibrate Settings")
      (setq mode (getkword "\nPlace a coordinate [Type/Pick/List/Calibrate/Settings] <Type>: "))
      (if (not mode) (setq mode "Type"))
      (cond
        ((= mode "Calibrate") (c:CPCAL))
        ((= mode "Settings")  (c:CPSET))
        (T
         (setq olde (getvar "ATTREQ") oldd (getvar "ATTDIA")
               oldc (getvar "CMDECHO") oldo (getvar "OSMODE"))
         (setvar "ATTREQ" 0) (setvar "ATTDIA" 0) (setvar "CMDECHO" 0)
         (command "._UNDO" "_BEGIN")
         (setq *CP-OPEN* T n 0)
         (cond ((= mode "Type") (setq n (cp:dotype)))
               ((= mode "Pick") (setq n (cp:dopick)))
               ((= mode "List") (setvar "OSMODE" 0) (setq n (cp:dolist))))
         (command "._UNDO" "_END")
         (setq *CP-OPEN* nil)
         (setvar "ATTREQ" olde) (setvar "ATTDIA" oldd)
         (setvar "CMDECHO" oldc) (setvar "OSMODE" oldo)
         (princ (strcat "\n\n" (itoa n) " callout(s) placed. One UNDO reverses them."))))))
  (princ))

(defun c:CPSTAT ()
  (princ "\n--- CP is currently set to ---")
  (princ (strcat "\n  Block      " *CP-BLOCK*
                 (if (tblsearch "BLOCK" *CP-BLOCK*)
                   "   (present in this drawing)"
                   "   (NOT in this drawing -- run CPCAL)")))
  (princ (strcat "\n  Scale      " (rtos *CP-SCALE* 2 6)
                 "   Rotation " (rtos *CP-ROT* 2 3)))
  (princ (strcat "\n  Northing   " *CP-NPFX* "   Easting " *CP-EPFX*
                 "   to " (itoa *CP-PREC*) " decimals"))
  (princ (strcat "\n  Tag        " (if (= *CP-TAGON* 1) "yes" "no")
                 "   next " *CP-NEXT* "   layer " *CP-TAGLAY*))
  (princ (strcat "\n  Offset     E" (rtos *CP-OFFE* 2 3) " N" (rtos *CP-OFFN* 2 3)))
  (princ))

(defun c:CPEND () (princ "\nCP.lsp: whole file loaded.") (princ))

(princ "\nCP.lsp loaded.  CPCAL to learn your block, then CP to place callouts.")
(princ "\n  CPSTAT shows the current settings.")
(princ)
