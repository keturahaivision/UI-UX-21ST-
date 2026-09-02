;;; ==========================================================================
;;;  GVLIST.lsp -- automatic gate-valve (GV) point list for AutoCAD / Civil 3D
;;; ==========================================================================
;;;
;;;  Commands
;;;  --------
;;;    GVPICK    click one valve (or any point) and read out / label its
;;;              Easting & Northing, adding it to the sequence
;;;    GVLIST    scan the drawing (or a selection) for every gate-valve symbol,
;;;              pair each with its GV label, number the unlabelled ones and
;;;              report the complete list
;;;    GVTABLE   draw the "GATE VALVE COORDINATES" table from the current list
;;;    GVCSV     write the current list out to a CSV file
;;;    GVSETUP   review / change the settings (block names, layers, precision,
;;;              text height, label offset, WCS -> survey-grid transform)
;;;    GVLABEL   place an N= / E= coordinate callout at a picked point
;;;
;;;  Settings are stored in the drawing, so they travel with the DWG.
;;;
;;;  Defaults are tuned for the NOC water drawings: gate-valve block
;;;  CI_PW_GVN_PROP on layer PW_GV, labels "GV<n>" at 1.5 units high.
;;; ==========================================================================

(vl-load-com)

;; --------------------------------------------------------------------------
;;  Settings
;; --------------------------------------------------------------------------

(setq *gv:dict* "GVPOINTTOOL")

;; wcmatch accepts comma-separated patterns, so each of these is a pattern set.
(setq *gv:defaults*
  (list
    (cons "BLOCKS"   "*CI_PW_GV*,*PW_GV*,*GATE?VALVE*,GV")   ; valve block names
    (cons "LAYERS"   "PW_GV,*$0$PW_GV,*_PW_GV")              ; valve layers
    (cons "LBLLAYER" "Text-Number")                          ; layer for new GV labels
    (cons "CALLAYER" "Proposed Spare Duct Coordinates")       ; layer for N=/E= callouts
    (cons "PREFIX"   "GV")                                   ; point-name prefix
    (cons "PREC"     "3")                                    ; decimal places
    (cons "MAXDIST"  "25.0")                                 ; label search radius
    (cons "TXTHT"    "1.5")                                  ; label text height
    (cons "LBLDX"    "0.340")                                ; label offset from valve
    (cons "LBLDY"    "-3.906")
    (cons "OFFE"     "0.0")                                  ; WCS -> grid transform
    (cons "OFFN"     "0.0")
    (cons "ROT"      "0.0")                                  ; degrees, counter-clockwise
    (cons "SCL"      "1.0")))

(defun gv:cfg-load ( / rec item key pos cfg)
  (setq cfg nil)
  (if (setq rec (dictsearch (namedobjdict) *gv:dict*))
    (foreach item rec
      (if (= 1 (car item))
        (progn
          (setq pos (vl-string-search "=" (cdr item)))
          (if pos
            (progn
              (setq key (substr (cdr item) 1 pos))
              (setq cfg (cons (cons key (substr (cdr item) (+ pos 2))) cfg))))))))
  ;; anything not stored in the drawing falls back to the default
  (foreach item *gv:defaults*
    (if (not (assoc (car item) cfg))
      (setq cfg (cons item cfg))))
  (setq *gv:cfg* cfg))

(defun gv:cfg-save ( / data xrec item)
  (setq data (list '(0 . "XRECORD") '(100 . "AcDbXrecord") '(280 . 1)))
  (foreach item *gv:cfg*
    (setq data (append data (list (cons 1 (strcat (car item) "=" (cdr item)))))))
  (if (setq xrec (entmakex data))
    (progn
      ;; dictadd will not overwrite, so clear any previous record first
      (dictremove (namedobjdict) *gv:dict*)
      (dictadd (namedobjdict) *gv:dict* xrec)))
  xrec)

(defun gv:get (key / hit)
  (if (not *gv:cfg*) (gv:cfg-load))
  (if (setq hit (assoc key *gv:cfg*)) (cdr hit) ""))

(defun gv:num (key) (atof (gv:get key)))
(defun gv:int (key) (atoi (gv:get key)))

(defun gv:set (key val)
  (if (not *gv:cfg*) (gv:cfg-load))
  (setq *gv:cfg* (cons (cons key val) (vl-remove (assoc key *gv:cfg*) *gv:cfg*)))
  val)

;; --------------------------------------------------------------------------
;;  Small helpers
;; --------------------------------------------------------------------------

(defun gv:rtos (x) (rtos x 2 (gv:int "PREC")))

(defun gv:effective-name (e / obj nm)
  "Block name, resolving dynamic-block anonymous names such as *U12."
  (setq nm (cdr (assoc 2 (entget e))))
  (if (and nm (= "*" (substr nm 1 1)))
    (progn
      (setq obj (vlax-ename->vla-object e))
      (if (vlax-property-available-p obj 'EffectiveName)
        (setq nm (vla-get-EffectiveName obj)))))
  nm)

(defun gv:is-valve (e / nm ly)
  (setq nm (gv:effective-name e))
  (setq ly (cdr (assoc 8 (entget e))))
  (or (and nm (wcmatch (strcase nm) (strcase (gv:get "BLOCKS"))))
      (and ly (wcmatch (strcase ly) (strcase (gv:get "LAYERS"))))))

(defun gv:strip-mtext (s / out i ch)
  "Drop the usual MTEXT formatting runs so \\A1;GV12 still reads as GV12."
  (setq out "" i 1)
  (while (<= i (strlen s))
    (setq ch (substr s i 1))
    (cond
      ((= ch "\\")
       ;; skip a format code up to its terminating ';'
       (setq i (1+ i))
       (while (and (<= i (strlen s)) (/= ";" (substr s i 1)))
         (setq i (1+ i)))
       (setq i (1+ i)))
      ((or (= ch "{") (= ch "}")) (setq i (1+ i)))
      (t (setq out (strcat out ch)) (setq i (1+ i)))))
  out)

(defun gv:label-number (s / pre n rest ch i digits)
  "Return the integer in a label like GV17, or nil when it is not a GV label."
  (setq s (gv:strip-mtext s))
  (setq s (vl-string-trim " \t" s))
  (setq pre (gv:get "PREFIX"))
  (if (and (>= (strlen s) (1+ (strlen pre)))
           (= (strcase pre) (strcase (substr s 1 (strlen pre)))))
    (progn
      (setq rest (vl-string-trim " -_" (substr s (1+ (strlen pre)))))
      (setq digits T i 1)
      (if (= 0 (strlen rest)) (setq digits nil))
      (while (and digits (<= i (strlen rest)))
        (setq ch (substr rest i 1))
        (if (or (< (ascii ch) 48) (> (ascii ch) 57)) (setq digits nil))
        (setq i (1+ i)))
      (if digits (atoi rest)))))

(defun gv:text-string (e / d)
  (setq d (entget e))
  (cond ((= "TEXT"  (cdr (assoc 0 d))) (cdr (assoc 1 d)))
        ((= "MTEXT" (cdr (assoc 0 d))) (cdr (assoc 1 d)))
        (t "")))

(defun gv:dist2d (a b)
  (distance (list (car a) (cadr a) 0.0) (list (car b) (cadr b) 0.0)))

;; --------------------------------------------------------------------------
;;  WCS -> survey grid
;; --------------------------------------------------------------------------

(defun gv:to-grid (p / dx dy a c s scl)
  "Apply the configured similarity transform to a WCS point.
   Returns (Easting Northing)."
  (setq a   (* pi (/ (gv:num "ROT") 180.0))
        scl (gv:num "SCL"))
  (if (<= scl 0.0) (setq scl 1.0))
  (setq c (cos a) s (sin a) dx (car p) dy (cadr p))
  (list (+ (* scl (- (* dx c) (* dy s))) (gv:num "OFFE"))
        (+ (* scl (+ (* dx s) (* dy c))) (gv:num "OFFN"))))

;; --------------------------------------------------------------------------
;;  Collecting valves and labels
;; --------------------------------------------------------------------------

(defun gv:collect-labels ( / ss i e n p r out)
  "All GV<n> texts in model space as (number x y ename rotation)."
  (setq out nil)
  (if (setq ss (ssget "_X" '((0 . "TEXT,MTEXT") (410 . "Model"))))
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq e (ssname ss i))
        (setq n (gv:label-number (gv:text-string e)))
        (if n
          (progn
            (setq p (cdr (assoc 10 (entget e))))
            (setq r (cdr (assoc 50 (entget e))))
            (if (not r) (setq r 0.0))
            (setq out (cons (list n (car p) (cadr p) e r) out))))
        (setq i (1+ i)))))
  out)

(defun gv:collect-valves (ss / i e p out)
  "Gate-valve inserts in ss (or the whole drawing when ss is nil) as (x y ename)."
  (setq out nil)
  (if (not ss) (setq ss (ssget "_X" '((0 . "INSERT") (410 . "Model")))))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq e (ssname ss i))
        (if (and (= "INSERT" (cdr (assoc 0 (entget e)))) (gv:is-valve e))
          (progn
            (setq p (cdr (assoc 10 (entget e))))
            (setq out (cons (list (car p) (cadr p) e) out))))
        (setq i (1+ i)))))
  out)

(defun gv:local-offset (lab v / dx dy c s)
  "Label -> valve offset expressed in the label's own rotated frame.
   Labels sit at a repeatable offset from their symbol, so in this frame every
   correct pair lands in the same tight cluster -- which makes the offset a far
   stronger discriminator than raw distance when valves are close together."
  (setq dx (- (car  v) (cadr  lab))
        dy (- (cadr v) (caddr lab))
        c  (cos (- (nth 4 lab)))
        s  (sin (- (nth 4 lab))))
  (list (- (* dx c) (* dy s)) (+ (* dx s) (* dy c))))

(defun gv:median (lst / srt n)
  (if (null lst)
    0.0
    (progn
      ;; a serial tiebreaker keeps vl-sort from silently dropping equal values
      (setq n 0)
      (setq srt (mapcar (function (lambda (x) (setq n (1+ n)) (list x n))) lst))
      (setq srt (vl-sort srt
                  (function (lambda (a b)
                    (if (equal (car a) (car b) 1e-12)
                      (< (cadr a) (cadr b))
                      (< (car a) (car b)))))))
      (car (nth (/ (length srt) 2) srt)))))

(defun gv:match (valves labels maxd prior mx my / cands serial v lab d o usedv usedl out c)
  "Greedy valve<->label assignment, best score first.

   With prior = nil the score is plain distance. With prior = T it is how far
   the pair's offset sits from (mx my), the typical label offset. Candidates are
   always capped at maxd."
  (setq cands nil serial 0)
  (foreach v valves
    (foreach lab labels
      (setq d (gv:dist2d (list (cadr lab) (caddr lab)) v))
      (if (<= d maxd)
        (progn
          (if prior
            (progn
              (setq o (gv:local-offset lab v))
              (setq d (distance (list (car o) (cadr o) 0.0) (list mx my 0.0)))))
          (setq serial (1+ serial))
          (setq cands (cons (list d serial v lab) cands))))))
  ;; the serial keeps the ordering total, so vl-sort cannot discard a candidate
  (setq cands (vl-sort cands
                (function (lambda (a b)
                  (if (equal (car a) (car b) 1e-12)
                    (< (cadr a) (cadr b))
                    (< (car a) (car b)))))))
  (setq usedv nil usedl nil out nil)
  (foreach c cands
    (setq v (caddr c) lab (cadddr c))
    (if (and (not (member (caddr v) usedv))
             (not (member (cadddr lab) usedl)))
      (progn
        (setq usedv (cons (caddr v) usedv)
              usedl (cons (cadddr lab) usedl))
        (setq out (cons (list v lab) out)))))
  out)

(defun gv:build (ss / valves labels maxd prs mx my pts num maxnum p v lab used serial)
  "Pair every valve with its label, number the leftovers, and sort the result.
   Each entry is (number Easting Northing ename labelled-p)."
  (gv:cfg-load)
  (setq valves (gv:collect-valves ss)
        labels (gv:collect-labels)
        maxd   (gv:num "MAXDIST"))
  ;; pass 1 -- match on distance, purely to learn the drawing's label offset
  (setq prs (gv:match valves labels maxd nil 0.0 0.0))
  (setq mx (gv:median (mapcar (function (lambda (p) (car  (gv:local-offset (cadr p) (car p))))) prs))
        my (gv:median (mapcar (function (lambda (p) (cadr (gv:local-offset (cadr p) (car p))))) prs)))
  ;; pass 2 -- rematch against that offset, which resolves crowded clusters
  (setq prs (gv:match valves labels maxd T mx my))

  (setq pts nil used nil maxnum 0 serial 0)
  (foreach p prs
    (setq v (car p) lab (cadr p) num (car lab))
    (if (> num maxnum) (setq maxnum num))
    (setq used (cons (caddr v) used) serial (1+ serial))
    (setq pts (cons (list num (car (gv:to-grid v)) (cadr (gv:to-grid v))
                          (caddr v) T serial)
                    pts)))
  ;; valves with no label of their own continue the sequence
  (foreach v valves
    (if (not (member (caddr v) used))
      (progn
        (setq maxnum (1+ maxnum) serial (1+ serial))
        (setq pts (cons (list maxnum (car (gv:to-grid v)) (cadr (gv:to-grid v))
                              (caddr v) nil serial)
                        pts)))))
  (setq pts (vl-sort pts
              (function (lambda (a b)
                (if (= (car a) (car b))
                  (< (nth 5 a) (nth 5 b))
                  (< (car a) (car b)))))))
  (setq *gv:points* pts)
  pts)

(defun gv:name (n) (strcat (gv:get "PREFIX") (itoa n)))

;; --------------------------------------------------------------------------
;;  Drawing output
;; --------------------------------------------------------------------------

(defun gv:ensure-layer (name)
  (if (and name (/= name "") (not (tblsearch "LAYER" name)))
    (entmakex (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord")
                    '(100 . "AcDbLayerTableRecord") (cons 2 name)
                    '(70 . 0) '(62 . 7) (cons 6 "Continuous"))))
  name)

(defun gv:make-text (p str layer height rot)
  (gv:ensure-layer layer)
  (entmakex (list '(0 . "TEXT") '(100 . "AcDbEntity")
                  (cons 8 layer) '(100 . "AcDbText")
                  (cons 10 (list (car p) (cadr p) 0.0))
                  (cons 40 height) (cons 1 str) (cons 50 rot))))

(defun gv:place-label (p num rot / q)
  "Put a GV<n> label at the standard offset from the valve at p."
  (setq q (list (+ (car p) (gv:num "LBLDX")) (+ (cadr p) (gv:num "LBLDY"))))
  (gv:make-text q (gv:name num) (gv:get "LBLLAYER") (gv:num "TXTHT") rot))

(defun gv:place-callout (p grid rot / h dy)
  "Put N= / E= coordinate text beside the point p (grid = (E N))."
  (setq h (gv:num "TXTHT") dy (* 1.4 h))
  (gv:make-text (list (car p) (+ (cadr p) dy))
                (strcat "N=" (gv:rtos (cadr grid))) (gv:get "CALLAYER") h rot)
  (gv:make-text (list (car p) (cadr p))
                (strcat "E=" (gv:rtos (car grid))) (gv:get "CALLAYER") h rot))

(defun gv:draw-table (pts pt / doc sp tbl rows r item)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object))
        sp  (vla-get-ModelSpace doc)
        rows (+ (length pts) 2))
  (setq tbl (vla-AddTable sp (vlax-3d-point (list (car pt) (cadr pt) 0.0))
                          rows 3 (* 3.4 (gv:num "TXTHT")) (* 22.0 (gv:num "TXTHT"))))
  (vla-SetText tbl 0 0 "GATE VALVE COORDINATES")
  (vla-SetText tbl 1 0 "POINTS")
  (vla-SetText tbl 1 1 "EASTING")
  (vla-SetText tbl 1 2 "NORTHING")
  (setq r 2)
  (foreach item pts
    (vla-SetText tbl r 0 (gv:name (car item)))
    (vla-SetText tbl r 1 (gv:rtos (cadr item)))
    (vla-SetText tbl r 2 (gv:rtos (caddr item)))
    (setq r (1+ r)))
  tbl)

;; --------------------------------------------------------------------------
;;  Commands
;; --------------------------------------------------------------------------

(defun c:GVSETUP ( / ans keys key val)
  (gv:cfg-load)
  (princ "\n--- GV point list settings ---")
  (setq keys (list
    (cons "BLOCKS"   "Valve block name pattern(s)")
    (cons "LAYERS"   "Valve layer pattern(s)")
    (cons "LBLLAYER" "Layer for new GV labels")
    (cons "CALLAYER" "Layer for N=/E= callouts")
    (cons "PREFIX"   "Point name prefix")
    (cons "PREC"     "Decimal places")
    (cons "MAXDIST"  "Label search radius")
    (cons "TXTHT"    "Text height")
    (cons "LBLDX"    "Label offset X from valve")
    (cons "LBLDY"    "Label offset Y from valve")
    (cons "OFFE"     "Grid transform: Easting offset")
    (cons "OFFN"     "Grid transform: Northing offset")
    (cons "ROT"      "Grid transform: rotation (degrees CCW)")
    (cons "SCL"      "Grid transform: scale")))
  (foreach key keys
    (princ (strcat "\n" (cdr key) " <" (gv:get (car key)) ">: "))
    (setq val (getstring T))
    (if (/= val "") (gv:set (car key) val)))
  (gv:cfg-save)
  (princ "\nSettings saved in this drawing.")
  (princ))

(defun c:GVPICK ( / e ed p grid num rot ans lab)
  (gv:cfg-load)
  (princ "\nSelect a gate valve (or press Enter to pick a point): ")
  (setq e (car (entsel)))
  (if e
    (progn
      (setq ed (entget e))
      (if (= "INSERT" (cdr (assoc 0 ed)))
        (setq p   (cdr (assoc 10 ed))
              rot (cdr (assoc 50 ed)))
        (progn
          (princ "\nThat is not a block -- pick a point instead.")
          (setq e nil)))))
  (if (not e)
    (progn
      (setq p (getpoint "\nPick the valve location: "))
      (setq rot 0.0)))
  (if (not p)
    (princ "\nNothing picked.")
    (progn
      (if (not rot) (setq rot 0.0))
      (setq grid (gv:to-grid p))
      ;; a valve that already carries a label keeps its number; anything else
      ;; continues the sequence
      (setq lab (gv:label-at p))
      (setq num (if lab (car lab) (gv:next-number)))
      (princ (strcat "\n" (gv:name num)
                     "   E=" (gv:rtos (car grid))
                     "   N=" (gv:rtos (cadr grid))
                     (if lab "   (existing label)" "   (new point)")))
      (initget "Yes No")
      (setq ans (getkword
                  (if lab
                    "\nPlace coordinate callout? [Yes/No] <Yes>: "
                    "\nPlace label and coordinate callout? [Yes/No] <Yes>: ")))
      (if (/= ans "No")
        (progn
          (if (not lab) (gv:place-label p num rot))
          (gv:place-callout (list (+ (car p) (* 3.0 (gv:num "TXTHT")))
                                  (cadr p))
                            grid rot)
          (princ (strcat "\nAnnotated " (gv:name num) "."))))))
  (princ))

(defun gv:label-at (p / best bestd d lab)
  "The GV label closest to p within MAXDIST, or nil."
  (setq best nil bestd (gv:num "MAXDIST"))
  (foreach lab (gv:collect-labels)
    (setq d (gv:dist2d (list (cadr lab) (caddr lab)) p))
    (if (<= d bestd) (setq bestd d best lab)))
  best)

(defun gv:next-number ( / labels n best)
  (setq best 0)
  (foreach n (gv:collect-labels)
    (if (> (car n) best) (setq best (car n))))
  (1+ best))

(defun c:GVLIST ( / ss pts item n unl)
  (gv:cfg-load)
  (princ "\nSelect gate valves, or press Enter to scan the whole drawing: ")
  (setq ss (ssget '((0 . "INSERT"))))
  (setq pts (gv:build ss))
  (if (not pts)
    (princ "\nNo gate-valve symbols found -- run GVSETUP and check the block/layer patterns.")
    (progn
      (setq unl 0)
      (princ (strcat "\n\nGATE VALVE COORDINATES  (" (itoa (length pts)) " points)"))
      (princ "\nPOINTS      EASTING          NORTHING")
      (foreach item pts
        (princ (strcat "\n" (gv:name (car item))
                       "\t" (gv:rtos (cadr item))
                       "\t" (gv:rtos (caddr item))
                       (if (nth 4 item) "" "   <- auto-numbered, no label in drawing")))
        (if (not (nth 4 item)) (setq unl (1+ unl))))
      (princ (strcat "\n\n" (itoa (length pts)) " point(s); "
                     (itoa unl) " had no GV label."))
      (princ "\nRun GVTABLE to draw the table, or GVCSV to export.")))
  (princ))

(defun c:GVTABLE ( / pt)
  (if (not *gv:points*) (gv:build nil))
  (if (not *gv:points*)
    (princ "\nNo points -- run GVLIST first.")
    (progn
      (setq pt (getpoint "\nPick the top-left corner of the table: "))
      (if pt
        (progn
          (gv:draw-table *gv:points* pt)
          (princ (strcat "\nTable drawn with " (itoa (length *gv:points*)) " points."))))))
  (princ))

(defun c:GVCSV ( / path fh item)
  (if (not *gv:points*) (gv:build nil))
  (if (not *gv:points*)
    (princ "\nNo points -- run GVLIST first.")
    (progn
      (setq path (getfiled "Save gate valve coordinates" "gate_valve_coordinates" "csv" 1))
      (if path
        (progn
          (setq fh (open path "w"))
          (if fh
            (progn
              (write-line "POINTS,EASTING,NORTHING,REMARKS" fh)
              (foreach item *gv:points*
                (write-line (strcat (gv:name (car item)) ","
                                    (gv:rtos (cadr item)) ","
                                    (gv:rtos (caddr item)) ","
                                    (if (nth 4 item) "" "auto-numbered (no GV label)"))
                            fh))
              (close fh)
              (princ (strcat "\nWrote " (itoa (length *gv:points*)) " points to " path)))
            (princ "\nCould not open that file for writing."))))))
  (princ))

(defun c:GVLABEL ( / p grid)
  (gv:cfg-load)
  (setq p (getpoint "\nPick the point to annotate: "))
  (if p
    (progn
      (setq grid (gv:to-grid p))
      (gv:place-callout (list (+ (car p) (* 3.0 (gv:num "TXTHT"))) (cadr p)) grid 0.0)
      (princ (strcat "\nE=" (gv:rtos (car grid)) "  N=" (gv:rtos (cadr grid))))))
  (princ))

(princ "\nGV point list loaded.  Commands: GVPICK  GVLIST  GVTABLE  GVCSV  GVSETUP  GVLABEL")
(princ)
