;;; ==========================================================================
;;;  OTHER_PLACE.lsp -- place coordinate callouts at 44 points
;;;  Generated 2026-09-02 from other_points.csv
;;;
;;;  Load with APPLOAD, then type:  OTHERPLACEPOINTS
;;; ==========================================================================

(vl-load-com)

;; ---- edit these if needed -------------------------------------------------

(setq *OT-BLOCK* "COOR XY")     ; attributed callout block
(setq *OT-SCALE* 1.608006)       ; its insertion scale
(setq *OT-ROT*   0.0000)         ; its rotation, degrees
(setq *OT-PREC*  3)        ; decimal places in the attribute text
(setq *OT-LABEL* nil)       ; T to also write the point name as text
(setq *OT-LAYER* "Text-Number") ; layer for that text
(setq *OT-HT*    1.500)       ; its height
(setq *OT-DX*    0.340)       ; where it sits relative to the point
(setq *OT-DY*    -3.906)

;; Leave these at 0 when the drawing is modelled on the survey grid. Set them
;; when the drawing sits in a local system, so E/N land in the right place.
(setq *OT-OFFE*  0.0)
(setq *OT-OFFN*  0.0)

;; ---- the coordinates ------------------------------------------------------

(setq *OT-POINTS* '(
  ("BV1"   477954.962 2744486.157)
  ("BV2"   477983.703 2744506.411)
  ("BV3"   478057.565 2744340.566)
  ("BV4"   478064.946 2744336.412)
  ("BV5"   478063.679 2744317.301)
  ("BV6"   478059.824 2744299.947)
  ("BV7"   478085.736 2744285.668)
  ("BV08"  478103.576 2744281.693)
  ("BV09"  478128.537 2744315.861)
  ("BV10"  478123.410 2744344.754)
  ("BV11"  478106.157 2744347.237)
  ("BV12"  478086.307 2744360.818)
  ("BV13"  478669.249 2744395.194)
  ("BV14"  478688.669 2744388.824)
  ("BV15"  478707.920 2744387.791)
  ("BV16"  478711.670 2744394.651)
  ("BV17"  478724.041 2744377.115)
  ("BV18"  478710.504 2744357.234)
  ("BV19"  478710.421 2744336.751)
  ("BV20"  478667.926 2744327.036)
  ("BV21"  478641.017 2744340.590)
  ("BV22"  478645.646 2744358.669)
  ("BV23"  478764.376 2744443.511)
  ("BV24"  478956.374 2744567.101)
  ("BV25"  478968.736 2744549.560)
  ("BV26"  478965.807 2744569.222)
  ("BV27"  478987.415 2744558.526)
  ("BV28"  479005.305 2744560.835)
  ("BV29"  479023.310 2744588.790)
  ("BV30"  479011.367 2744605.857)
  ("WO1"   477987.999 2744439.279)
  ("AV"    478084.218 2743660.405)
  ("MBV1"  477917.606 2744540.258)
  ("MBV2"  477926.555 2744527.560)
  ("MBV3"  477933.043 2744524.581)
  ("MBV4"  477933.621 2744517.534)
  ("MBV5"  479049.990 2744607.593)
  ("MBV6"  479052.931 2744614.016)
  ("MBV7"  479060.024 2744614.664)
  ("MBV8"  479072.723 2744623.613)
  ("FM1"   477920.597 2744536.015)
  ("FM2"   479068.479 2744620.622)
  ("PRV1"  477930.122 2744522.499)
  ("PRV2"  479054.960 2744611.102)
))

;; ---- the work -------------------------------------------------------------

(defun OTp:attribs (e / out nx)
  "The ATTRIB entities belonging to an INSERT."
  (setq out nil nx (entnext e))
  (while (and nx (= "ATTRIB" (cdr (assoc 0 (entget nx)))))
    (setq out (cons nx out) nx (entnext nx)))
  (reverse out))

(defun OTp:place (name ex ny / p ns es obj a d tag filled)
  "Insert the callout at (ex ny) and write the coordinates into its attributes.

   Attributes are matched by tag, never by position, so it does not matter how
   many the block has or what order it defines them in."
  (setq p  (list (+ ex *OT-OFFE*) (+ ny *OT-OFFN*) 0.0)
        ns (strcat "N=" (rtos ny 2 *OT-PREC*))
        es (strcat "E=" (rtos ex 2 *OT-PREC*))
        filled 0)
  ;; _non defeats running osnap, which would otherwise pull the block onto
  ;; whatever happens to lie near the point
  (command "._-INSERT" *OT-BLOCK* "_non" p *OT-SCALE* *OT-SCALE* *OT-ROT*)
  (setq obj (entlast))
  (if (/= "INSERT" (cdr (assoc 0 (entget obj))))
    (progn (princ "\n  the insert did not complete -- stopping.") (setq obj nil)))
  (if obj
    (progn
      (foreach a (OTp:attribs obj)
        (setq d (entget a) tag (strcase (cdr (assoc 2 d))))
        (cond
          ((wcmatch tag "Y*,N*")
           (entmod (subst (cons 1 ns) (assoc 1 d) d)) (setq filled (1+ filled)))
          ((wcmatch tag "X*,E*")
           (entmod (subst (cons 1 es) (assoc 1 d) d)) (setq filled (1+ filled)))))
      (entupd obj)
      (setq *OT-FILLED* (+ *OT-FILLED* filled))))
  (if (and obj *OT-LABEL*)
    (progn
      (if (not (tblsearch "LAYER" *OT-LAYER*))
        (entmakex (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord")
                        '(100 . "AcDbLayerTableRecord") (cons 2 *OT-LAYER*)
                        '(70 . 0) '(62 . 7) (cons 6 "Continuous"))))
      (entmakex (list '(0 . "TEXT") '(100 . "AcDbEntity")
                      (cons 8 *OT-LAYER*) '(100 . "AcDbText")
                      (cons 10 (list (+ (car p) *OT-DX*) (+ (cadr p) *OT-DY*) 0.0))
                      (cons 40 *OT-HT*) (cons 1 name) '(50 . 0.0)))))
  obj)

(defun c:OTHERPLACEPOINTS ( / olde oldd oldc oldo n item)
  (setq *OT-FILLED* 0)
  (if (not (tblsearch "BLOCK" *OT-BLOCK*))
    (progn
      (princ (strcat "\nBlock \"" *OT-BLOCK* "\" is not in this drawing."))
      (princ "\nInsert one copy of it first, then run this again."))
    (progn
      (setq olde (getvar "ATTREQ") oldd (getvar "ATTDIA")
            oldc (getvar "CMDECHO") oldo (getvar "OSMODE"))
      (setvar "ATTREQ" 0) (setvar "ATTDIA" 0)
      (setvar "CMDECHO" 0) (setvar "OSMODE" 0)
      (command "._UNDO" "_BEGIN")
      (setq n 0 *OT-FILLED* 0)
      (foreach item *OT-POINTS*
        (OTp:place (car item) (cadr item) (caddr item))
        (setq n (1+ n)))
      (command "._UNDO" "_END")
      (setvar "ATTREQ" olde) (setvar "ATTDIA" oldd)
      (setvar "CMDECHO" oldc) (setvar "OSMODE" oldo)
      (princ (strcat "\nPlaced " (itoa n) " callout(s) using \"" *OT-BLOCK* "\"."))
      (princ (strcat "\nFilled " (itoa *OT-FILLED*) " attribute(s) -- "
                     (if (> *OT-FILLED* 0)
                       (strcat (rtos (/ (float *OT-FILLED*) (float n)) 2 1) " per callout.")
                       "NONE. The block has no N/E attributes the tool recognises.")))
      (princ "\nOne UNDO reverses the whole run.")))
  (princ))

(princ (strcat "\nOTHER_PLACE.lsp loaded -- 44 points ready.  Type OTHERPLACEPOINTS"))
(princ)
