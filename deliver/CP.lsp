;;; ==========================================================================
;;;  CP.lsp -- coordinate callouts, the friendly way
;;; ==========================================================================
;;;
;;;  One command:  CP
;;;
;;;      Type       key in a coordinate as N= and E= and place it
;;;      Pick       click a point and it reads the coordinate for you
;;;      List       place a whole CSV at once
;;;      Calibrate  learn your callout block by clicking one you already have
;;;      Settings   change anything the calibration guessed
;;;
;;;  Nothing needs configuring before first use. Run CP, choose Calibrate,
;;;  click one existing callout, and the tool works out the block, its scale,
;;;  which attribute holds the northing, the "N=" wording, the number of
;;;  decimals, and whether the drawing sits on the survey grid.
;;;
;;;  Placement uses -INSERT and fills attributes BY TAG, never by position,
;;;  so the block's attribute count and order do not matter.
;;; ==========================================================================

(vl-load-com)

;; --------------------------------------------------------------------------
;;  Settings.  Held in globals, and saved into the drawing when that is
;;  possible -- a dictionary problem must never stop the tool working.
;; --------------------------------------------------------------------------

(defun cp:defaults ()
  (if (not cp:block)   (setq cp:block   "COOR XY"))
  (if (not cp:scale)   (setq cp:scale   1.0))
  (if (not cp:rot)     (setq cp:rot     0.0))
  (if (not cp:prec)    (setq cp:prec    3))
  (if (not cp:npfx)    (setq cp:npfx    "N="))
  (if (not cp:epfx)    (setq cp:epfx    "E="))
  (if (not cp:tagon)   (setq cp:tagon   T))
  (if (not cp:taglay)  (setq cp:taglay  "CP-TAG"))
  (if (not cp:offe)    (setq cp:offe    0.0))
  (if (not cp:offn)    (setq cp:offn    0.0))
  (if (not cp:next)    (setq cp:next    "P1"))
  (princ))

(defun cp:setting-list ()
  (list (cons "BLOCK"  cp:block)  (cons "SCALE" (rtos cp:scale 2 6))
        (cons "ROT"   (rtos cp:rot 2 4)) (cons "PREC" (itoa cp:prec))
        (cons "NPFX"   cp:npfx)   (cons "EPFX"  cp:epfx)
        (cons "TAGON" (if cp:tagon "1" "0")) (cons "TAGLAY" cp:taglay)
        (cons "OFFE"  (rtos cp:offe 2 6)) (cons "OFFN" (rtos cp:offn 2 6))
        (cons "NEXT"   cp:next)))

(defun cp:save-1 ( / data item xrec)
  (setq data '((0 . "XRECORD") (100 . "AcDbXrecord") (280 . 1)))
  (foreach item (cp:setting-list)
    (setq data (append data (list (cons 1 (strcat (car item) "=" (cdr item)))))))
  (if (setq xrec (entmakex data))
    (progn
      (dictremove (namedobjdict) "CPTOOL")
      (dictadd (namedobjdict) "CPTOOL" xrec))))

(defun cp:save ()
  ;; settings are a convenience -- a dictionary problem must never stop the
  ;; tool placing callouts, so the write is caught
  (vl-catch-all-apply 'cp:save-1 nil)
  (princ))

(defun cp:apply (key val)
  (cond
    ((= key "BLOCK")  (setq cp:block  val))
    ((= key "SCALE")  (setq cp:scale  (atof val)))
    ((= key "ROT")    (setq cp:rot    (atof val)))
    ((= key "PREC")   (setq cp:prec   (atoi val)))
    ((= key "NPFX")   (setq cp:npfx   val))
    ((= key "EPFX")   (setq cp:epfx   val))
    ((= key "TAGON")  (setq cp:tagon  (= val "1")))
    ((= key "TAGLAY") (setq cp:taglay val))
    ((= key "OFFE")   (setq cp:offe   (atof val)))
    ((= key "OFFN")   (setq cp:offn   (atof val)))
    ((= key "NEXT")   (setq cp:next   val))))

(defun cp:load-1 ( / rec item pos)
  (if (setq rec (dictsearch (namedobjdict) "CPTOOL"))
    (foreach item rec
      (if (= 1 (car item))
        (progn
          (setq pos (vl-string-search "=" (cdr item)))
          (if pos
            (cp:apply (substr (cdr item) 1 pos)
                      (substr (cdr item) (+ pos 2)))))))))

(defun cp:load ()
  (cp:defaults)
  (vl-catch-all-apply 'cp:load-1 nil)
  (if (<= cp:scale 0.0) (setq cp:scale 1.0))
  (princ))

;; --------------------------------------------------------------------------
;;  Reading what the user types
;; --------------------------------------------------------------------------

(defun cp:num-at (s i / n c start seen out)
  "The number starting at or after position i in s, or nil.
   Understands a leading minus and one decimal point."
  (setq n (strlen s) start nil seen nil out nil)
  (while (and (<= i n) (not out))
    (setq c (substr s i 1))
    (cond
      ((and (null start) (or (and (>= (ascii c) 48) (<= (ascii c) 57))
                             (and (= c "-") (< i n)
                                  (>= (ascii (substr s (1+ i) 1)) 48)
                                  (<= (ascii (substr s (1+ i) 1)) 57))))
       (setq start i))
      ((and start (not (or (and (>= (ascii c) 48) (<= (ascii c) 57))
                           (and (= c ".") (not seen)))))
       (setq out (substr s start (- i start))))
      (T nil))
    (if (and start (= c ".")) (setq seen T))
    (setq i (1+ i)))
  (if (and start (not out)) (setq out (substr s start)))
  (if out (distof out 2)))

(defun cp:label-num (s letter / up pos n)
  "The first number following LETTER in s -- so \"N=2744292.332\" gives the
   northing however it is spaced or punctuated."
  (setq up (strcase s) pos 1 n nil)
  (while (and (<= pos (strlen up)) (not n))
    (if (= (substr up pos 1) letter) (setq n (cp:num-at s (1+ pos))))
    (setq pos (1+ pos)))
  n)

(defun cp:has-digit (s / i found)
  (setq i 1 found nil)
  (while (and (<= i (strlen s)) (not found))
    (if (and (>= (ascii (substr s i 1)) 48) (<= (ascii (substr s i 1)) 57))
      (setq found T))
    (setq i (1+ i)))
  found)

(defun cp:nums (s / i n c cur out)
  "Every number in s, in order. A minus only counts at the start of one."
  (setq i 1 n (strlen s) cur "" out nil)
  (while (<= i (1+ n))
    (setq c (if (<= i n) (substr s i 1) " "))
    (if (or (and (>= (ascii c) 48) (<= (ascii c) 57))
            (and (= c ".") (/= cur ""))
            (and (= c "-") (= cur "")))
      (setq cur (strcat cur c))
      (progn
        (if (and (/= cur "") (cp:has-digit cur) (distof cur 2))
          (setq out (cons (distof cur 2) out)))
        (setq cur "")))
    (setq i (1+ i)))
  (reverse out))

(defun cp:other (nums v / x out)
  "The first number in nums that is not v -- the partner of a labelled value."
  (setq out nil)
  (foreach x nums (if (and (null out) (not (equal x v 1e-9))) (setq out x)))
  out)

(defun cp:parse-ne (s / nn ee nums)
  "Pull a northing and easting out of whatever the user pasted.

   Accepts  N=2744292.332 E=478042.125  in either order, with or without the
   letters, the = signs or the commas, and with either value missing.
   Two bare numbers are read as northing then easting.
   Returns (northing easting), either of which may be nil."
  (setq nn   (cp:label-num s "N")
        ee   (cp:label-num s "E")
        nums (cp:nums s))
  (cond
    ((and nn ee) (list nn ee))
    (nn          (list nn (cp:other nums nn)))
    (ee          (list (cp:other nums ee) ee))
    ((>= (length nums) 2) (list (car nums) (cadr nums)))
    ((= (length nums) 1)  (list (car nums) nil))
    (T (list nil nil))))

(defun cp:ask-ne ( / s pair nn ee)
  "Ask for the coordinate. One line with both values is enough."
  (setq nn nil ee nil)
  (while (not nn)
    (setq s (getstring T (strcat "\nNorthing " cp:npfx
                                 " (or paste both N and E, . to cancel): ")))
    (if (= s ".") (setq nn 'quit))
    (if (/= s ".")
      (progn
        (setq pair (cp:parse-ne s))
        (setq nn (car pair) ee (cadr pair))
        (if (not nn) (princ "\n  I could not find a number in that. Try again.")))))
  (if (eq nn 'quit)
    nil
    (progn
      (while (not ee)
        (setq s (getstring T (strcat "\nEasting " cp:epfx " (. to cancel): ")))
        (if (= s ".") (setq ee 'quit))
        (if (/= s ".")
          (progn
            (setq ee (cp:label-num s "E"))
            (if (not ee) (setq ee (cp:num-at s 1)))
            (if (not ee) (princ "\n  I could not find a number in that. Try again.")))))
      (if (eq ee 'quit) nil (list nn ee)))))

(defun cp:bump (s / i c digits head)
  "GV7 -> GV8, P09 -> P10, PIT -> PIT. Keeps any leading zeros."
  (setq i (strlen s) digits "")
  (while (and (> i 0)
              (>= (ascii (substr s i 1)) 48) (<= (ascii (substr s i 1)) 57))
    (setq digits (strcat (substr s i 1) digits) i (1- i)))
  (if (= digits "")
    s
    (progn
      (setq head (substr s 1 i)
            c    (itoa (1+ (atoi digits))))
      (while (< (strlen c) (strlen digits)) (setq c (strcat "0" c)))
      (strcat head c))))

;; --------------------------------------------------------------------------
;;  Placing
;; --------------------------------------------------------------------------

(defun cp:attribs (e / out nx)
  (setq out nil nx (entnext e))
  (while (and nx (= "ATTRIB" (cdr (assoc 0 (entget nx)))))
    (setq out (cons nx out) nx (entnext nx)))
  (reverse out))

(defun cp:ensure-layer (nm)
  (if (and nm (/= nm "") (not (tblsearch "LAYER" nm)))
    (entmakex (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord")
                    '(100 . "AcDbLayerTableRecord") (cons 2 nm)
                    '(70 . 0) '(62 . 7) (cons 6 "Continuous"))))
  nm)

(defun cp:tag-above (obj tag / atts a d p best bh brot bx)
  "Put the tag text above the callout.

   The position comes from the block's own attributes -- the highest one is
   found and the tag goes above it, at its height and rotation. Nothing about
   the block's geometry has to be known in advance."
  (setq atts (cp:attribs obj) best nil bh 2.5 brot 0.0 bx nil)
  (foreach a atts
    (setq d (entget a) p (cdr (assoc 10 d)))
    (if (or (null best) (> (cadr p) best))
      (setq best (cadr p) bx (car p)
            bh   (cond ((cdr (assoc 40 d))) (2.5))
            brot (cond ((cdr (assoc 50 d))) (0.0)))))
  (if best
    (progn
      (cp:ensure-layer cp:taglay)
      (entmakex (list '(0 . "TEXT") '(100 . "AcDbEntity")
                      (cons 8 cp:taglay) '(100 . "AcDbText")
                      (cons 10 (list bx (+ best (* 1.8 bh)) 0.0))
                      (cons 40 bh) (cons 1 tag) (cons 50 brot))))))

(defun cp:place (nn ee tag at / p ns es obj a d atag filled)
  "Insert the callout and fill it in. Returns the number of attributes written.
   at = where to put the block; nil means at the coordinate itself."
  (setq ns (strcat cp:npfx (rtos nn 2 cp:prec))
        es (strcat cp:epfx (rtos ee 2 cp:prec))
        filled 0)
  (setq p (if at
            (list (car at) (cadr at) 0.0)
            (list (+ ee cp:offe) (+ nn cp:offn) 0.0)))
  (command "._-INSERT" cp:block "_non" p cp:scale cp:scale cp:rot)
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
      (if (and cp:tagon tag (/= tag "")) (cp:tag-above obj tag)))
    (setq obj nil))
  filled)

;; --------------------------------------------------------------------------
;;  Calibration -- learn the block from one the user already has
;; --------------------------------------------------------------------------

(defun cp:pfx-of (s / i c)
  "Everything before the first digit or minus sign: \"N=\" out of \"N=2744292.332\"."
  (setq i 1)
  (while (and (<= i (strlen s))
              (setq c (substr s i 1))
              (not (or (= c "-") (and (>= (ascii c) 48) (<= (ascii c) 57)))))
    (setq i (1+ i)))
  (substr s 1 (1- i)))

(defun cp:dec-of (s / pos rest i c n)
  "Decimal places in the number inside s."
  (setq pos (vl-string-search "." s) n 0)
  (if pos
    (progn
      (setq i (+ pos 2))
      (while (and (<= i (strlen s))
                  (setq c (substr s i 1))
                  (>= (ascii c) 48) (<= (ascii c) 57))
        (setq n (1+ n) i (1+ i)))))
  n)

(defun c:CPCAL ( / e d p atts a ad tag txt val nn ee nsam esam)
  "Click one correct callout; everything else is worked out from it."
  (cp:load)
  (princ "\nSelect one coordinate callout you already have: ")
  (setq e (car (entsel)))
  (if (or (not e) (/= "INSERT" (cdr (assoc 0 (entget e)))))
    (princ "\nThat is not a block. Nothing changed.")
    (progn
      (setq d (entget e) p (cdr (assoc 10 d)) atts (cp:attribs e))
      (if (null atts)
        (princ "\nThat block carries no attributes, so there is nothing to learn.")
        (progn
          (setq cp:block (cp:effective-name e)
                cp:scale (cond ((cdr (assoc 41 d))) (1.0))
                cp:rot   (/ (* 180.0 (cond ((cdr (assoc 50 d))) (0.0))) pi))
          (if (<= cp:scale 0.0) (setq cp:scale 1.0))
          ;; work out which attribute holds which value by comparing each
          ;; against the block's own insertion point
          (setq nsam nil esam nil)
          (foreach a atts
            (setq ad (entget a) tag (strcase (cdr (assoc 2 ad)))
                  txt (cdr (assoc 1 ad)) val (cp:num-at txt 1))
            (if val
              (progn
                (if (and (not nsam) (< (abs (- val (cadr p))) 0.5)) (setq nsam txt))
                (if (and (not esam) (< (abs (- val (car  p))) 0.5)) (setq esam txt)))))
          ;; failing that, fall back on the tag names
          (if (not nsam)
            (foreach a atts
              (setq ad (entget a) tag (strcase (cdr (assoc 2 ad))))
              (if (and (not nsam) (wcmatch tag "Y*,N*")) (setq nsam (cdr (assoc 1 ad))))))
          (if (not esam)
            (foreach a atts
              (setq ad (entget a) tag (strcase (cdr (assoc 2 ad))))
              (if (and (not esam) (wcmatch tag "X*,E*")) (setq esam (cdr (assoc 1 ad))))))
          (if nsam (setq cp:npfx (cp:pfx-of nsam) cp:prec (cp:dec-of nsam)))
          (if esam (setq cp:epfx (cp:pfx-of esam)))
          ;; if the text disagrees with where the block sits, that difference
          ;; is the drawing's offset from the survey grid
          (setq nn (if nsam (cp:num-at nsam 1)) ee (if esam (cp:num-at esam 1)))
          (if (and nn ee)
            (setq cp:offn (- (cadr p) nn) cp:offe (- (car p) ee)))
          (cp:save)
          (princ "\n--- learned from that callout ---")
          (princ (strcat "\n  Block        " cp:block))
          (princ (strcat "\n  Scale        " (rtos cp:scale 2 6)
                         "    Rotation " (rtos cp:rot 2 3)))
          (princ (strcat "\n  Northing     " cp:npfx "  to " (itoa cp:prec) " decimals"
                         (if nsam (strcat "   e.g. " nsam) "")))
          (princ (strcat "\n  Easting      " cp:epfx
                         (if esam (strcat "                e.g. " esam) "")))
          (if (and (equal cp:offe 0.0 0.001) (equal cp:offn 0.0 0.001))
            (princ "\n  Coordinates  the drawing is on the survey grid")
            (princ (strcat "\n  Coordinates  drawing sits E" (rtos cp:offe 2 3)
                           " N" (rtos cp:offn 2 3) " from the survey grid")))
          (princ "\n\nSaved in this drawing. Run CP to place callouts.")))))
  (princ))

(defun cp:effective-name (e / obj nm)
  (setq nm (cdr (assoc 2 (entget e))))
  (if (and nm (= "*" (substr nm 1 1)))
    (progn
      (setq obj (vlax-ename->vla-object e))
      (if (vlax-property-available-p obj 'EffectiveName)
        (setq nm (vla-get-EffectiveName obj)))))
  nm)

;; --------------------------------------------------------------------------
;;  Settings
;; --------------------------------------------------------------------------

(defun cp:ask (label cur / s)
  (setq s (getstring T (strcat "\n  " label " <" cur ">: ")))
  (if (= s "") cur s))

(defun c:CPSET ( / s)
  (cp:load)
  (princ "\n--- CP settings (Enter keeps the current value) ---")
  (setq cp:block  (cp:ask "Callout block name" cp:block))
  (setq cp:scale  (atof (cp:ask "Block scale" (rtos cp:scale 2 6))))
  (if (<= cp:scale 0.0) (setq cp:scale 1.0))
  (setq cp:rot    (atof (cp:ask "Block rotation, degrees" (rtos cp:rot 2 4))))
  (setq cp:npfx   (cp:ask "Northing wording" cp:npfx))
  (setq cp:epfx   (cp:ask "Easting wording"  cp:epfx))
  (setq cp:prec   (atoi (cp:ask "Decimal places" (itoa cp:prec))))
  (setq s         (cp:ask "Write a tag above each callout? (Y/N)" (if cp:tagon "Y" "N")))
  (setq cp:tagon  (or (= (strcase s) "Y") (= s "1")))
  (setq cp:taglay (cp:ask "Layer for the tag text" cp:taglay))
  (setq cp:next   (cp:ask "Next tag to suggest" cp:next))
  (setq cp:offe   (atof (cp:ask "Drawing offset from grid, E" (rtos cp:offe 2 6))))
  (setq cp:offn   (atof (cp:ask "Drawing offset from grid, N" (rtos cp:offn 2 6))))
  (cp:save)
  (princ "\nSaved in this drawing.")
  (princ))

;; --------------------------------------------------------------------------
;;  The three ways to place
;; --------------------------------------------------------------------------

(defun cp:ask-tag ( / s)
  (if (not cp:tagon)
    ""
    (progn
      (setq s (getstring T (strcat "\nTag <" cp:next ">  (. for none): ")))
      (cond ((= s "") cp:next)
            ((= s ".") "")
            (T s)))))

(defun cp:do-type ( / pair nn ee tag at n more)
  (setq more T n 0)
  (while more
    (setq pair (cp:ask-ne))
    (if (not pair)
      (setq more nil)
      (progn
        (setq nn (car pair) ee (cadr pair) tag (cp:ask-tag))
        (setq at (getpoint "\nPick where the callout goes (Enter to put it on the coordinate): "))
        (if (> (cp:place nn ee tag at) 0)
          (progn
            (setq n (1+ n))
            (if (/= tag "") (setq cp:next (cp:bump tag)))
            (princ (strcat "\n  placed " cp:npfx (rtos nn 2 cp:prec)
                           "  " cp:epfx (rtos ee 2 cp:prec)
                           (if (/= tag "") (strcat "  tag " tag) ""))))
          (progn (princ "\n  nothing was written -- run CPCAL.") (setq more nil))))))
  n)

(defun cp:do-pick ( / p nn ee tag at n more)
  (setq more T n 0)
  (while more
    (setq p (getpoint "\nPick the point to annotate (Enter to stop): "))
    (if (not p)
      (setq more nil)
      (progn
        (setq ee (- (car p) cp:offe) nn (- (cadr p) cp:offn))
        (princ (strcat "\n  " cp:npfx (rtos nn 2 cp:prec)
                       "   " cp:epfx (rtos ee 2 cp:prec)))
        (setq tag (cp:ask-tag))
        (setq at (getpoint p "\nPick where the callout goes (Enter to put it on the point): "))
        (if (not at) (setq at p))
        (if (> (cp:place nn ee tag at) 0)
          (progn
            (setq n (1+ n))
            (if (/= tag "") (setq cp:next (cp:bump tag))))
          (progn (princ "\n  nothing was written -- run CPCAL.") (setq more nil))))))
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

(defun cp:do-list ( / path fh line cells first it ie inn n tag nn ee)
  (setq path (getfiled "Select the coordinate CSV" "" "csv" 16))
  (if (not path)
    0
    (progn
      (setq fh (open path "r") n 0 first T it 0 ie 1 inn 2)
      (if (not fh)
        (progn (princ "\nCould not open that file.") 0)
        (progn
          (while (setq line (read-line fh))
            (setq cells (mapcar 'cp:trim (cp:split line)))
            (cond
              ((< (length cells) 3) nil)
              ((and first (not (cp:num-at (nth 1 cells) 1)))
               (setq first nil
                     it  (cond ((cp:col cells "POINT*,NAME*,TAG*,ID*")) (0))
                     ie  (cond ((cp:col cells "EAST*,E,X"))  (1))
                     inn (cond ((cp:col cells "NORTH*,N,Y")) (2))))
              (T
               (setq first nil
                     ee (cp:num-at (nth ie cells) 1)
                     nn (cp:num-at (nth inn cells) 1)
                     tag (if cp:tagon (nth it cells) ""))
               (if (and ee nn)
                 (if (> (cp:place nn ee tag nil) 0) (setq n (1+ n)))))))
          (close fh)
          n)))))

;; --------------------------------------------------------------------------
;;  CP -- the front door
;; --------------------------------------------------------------------------

(defun c:CP ( / mode n olde oldd oldc oldo)
  (cp:load)
  (if (not (tblsearch "BLOCK" cp:block))
    (progn
      (princ (strcat "\nThe callout block \"" cp:block "\" is not in this drawing."))
      (princ "\nInsert one copy of it, then run CP again -- or run CPCAL and click one."))
    (progn
      (initget "Type Pick List Calibrate Settings Help")
      (setq mode (getkword "\nPlace a coordinate [Type/Pick/List/Calibrate/Settings/Help] <Type>: "))
      (if (not mode) (setq mode "Type"))
      (cond
        ((= mode "Help")
         (princ "\n\n  CP -- coordinate callouts")
         (princ "\n    Type       key in N and E. Paste both on one line if you like.")
         (princ "\n    Pick       click a point, the coordinate is read for you.")
         (princ "\n    List       place a whole CSV at once.")
         (princ "\n    Calibrate  click a callout you already have; the tool copies it.")
         (princ "\n    Settings   change anything by hand.")
         (princ (strcat "\n\n  Now using block \"" cp:block "\", "
                        cp:npfx "/" cp:epfx " to " (itoa cp:prec) " decimals."))
         (princ (strcat "\n  Tag above each callout: " (if cp:tagon "yes" "no")
                        "    next tag " cp:next)))
        ((= mode "Calibrate") (c:CPCAL))
        ((= mode "Settings")  (c:CPSET))
        (T
         (setq olde (getvar "ATTREQ") oldd (getvar "ATTDIA")
               oldc (getvar "CMDECHO") oldo (getvar "OSMODE"))
         (setvar "ATTREQ" 0) (setvar "ATTDIA" 0) (setvar "CMDECHO" 0)
         (command "._UNDO" "_BEGIN")
         (setq n (cond ((= mode "Type") (cp:do-type))
                       ((= mode "Pick") (cp:do-pick))
                       ((= mode "List") (setvar "OSMODE" 0) (cp:do-list))
                       (T 0)))
         (command "._UNDO" "_END")
         (setvar "ATTREQ" olde) (setvar "ATTDIA" oldd)
         (setvar "CMDECHO" oldc) (setvar "OSMODE" oldo)
         (cp:save)
         (princ (strcat "\n\n" (itoa n) " callout(s) placed. One UNDO reverses them all."))))))
  (princ))

(princ "\nCP loaded.  Type CP to place a coordinate callout.")
(princ "\n  First time in a drawing?  CP -> Calibrate, and click a callout you already have.")
(princ)
