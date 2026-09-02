================================================================================
  COORDINATE CALLOUTS - 218 points
================================================================================

WHAT THIS DOES
  Inserts your "COOR XY" block at each coordinate and fills in its N= and E=
  attributes. 174 gate valves, plus 44 other valve points. One command each,
  one undo each.

FILES
  GV_PLACE.lsp        174 gate valve points.        Command: GVPLACEPOINTS
  OTHER_PLACE.lsp     44 other valve points.        Command: OTHERPLACEPOINTS
  all_gv_points.csv   the 174 coordinates  (GV1 to GV174)
  other_points.csv    the 44 coordinates   (BV, MBV, FM, PRV, WO, AV)
  README.txt          this file.

  The two .lsp files are independent - load one, or both, in any order.
  They share no names, so neither interferes with the other.

  OTHER_PLACE.lsp covers:
      BV1  - BV30    butterfly valve                30 points
      MBV1 - MBV8    motorized butterfly valve       8 points
      FM1  - FM2     flow meter                      2 points
      PRV1 - PRV2    pressure reducing valve         2 points
      WO1            washout                         1 point
      AV             air valve                       1 point
                                                    ---------
                                                     44 points


--------------------------------------------------------------------------------
STEP 1   Save GV_PLACE.lsp somewhere permanent
--------------------------------------------------------------------------------
  C:\CAD\GV_PLACE.lsp   is fine.
  NOT your Downloads folder - AutoCAD refuses to run programs from there.


--------------------------------------------------------------------------------
STEP 2   Open a COPY of your drawing
--------------------------------------------------------------------------------
  Work on a copy until you have seen this behave once.


--------------------------------------------------------------------------------
STEP 3   Check you are in the right drawing
--------------------------------------------------------------------------------
  Command: ID
  ...then click any gate valve. Read the X and Y it reports.

    X about  478042 , Y about 2744292   ->  correct drawing, carry on
    X about  -30171 , Y about    2372   ->  this is the local-coordinate
                                            drawing. Either open the survey
                                            grid one, or see STEP 7.


--------------------------------------------------------------------------------
STEP 4   Check the block is in the drawing
--------------------------------------------------------------------------------
  Command: INSERT
  Look in the block list for:   COOR XY

  Not there?  Open COOR_XY.dwg, copy one block, paste it into your drawing,
  then press U to remove it. The block definition stays behind, which is all
  that matters. Close the INSERT dialog with Cancel.


--------------------------------------------------------------------------------
STEP 5   Load the tool
--------------------------------------------------------------------------------
  Command: APPLOAD
  Browse to GV_PLACE.lsp, click Load, then Close.

  You should see:
      GV_PLACE.lsp loaded -- 174 points ready.  Type GVPLACEPOINTS

  If AutoCAD refuses to load it:
      Options -> Files -> Trusted Locations -> Add -> C:\CAD\
      Then try APPLOAD again.


--------------------------------------------------------------------------------
STEP 6   Run it
--------------------------------------------------------------------------------
  Command: GVPLACEPOINTS        (after loading GV_PLACE.lsp)
  Command: OTHERPLACEPOINTS     (after loading OTHER_PLACE.lsp)

  You should see, for the gate valves:
      Placed 174 callout(s) using "COOR XY".
      Filled 696 attribute(s) -- 4.0 per callout.
      One UNDO reverses the whole run.

  ...and for the others:
      Placed 44 callout(s) using "COOR XY".
      Filled 176 attribute(s) -- 4.0 per callout.

  Each command is its own single UNDO, so you can run one, look at it,
  and undo just that one without losing the other.

  Then:  ZOOM  ->  E     to see them all.

  THE SECOND LINE IS THE ONE THAT MATTERS.
      "Filled 0 attribute(s) ... NONE"  means the blocks were placed but the
      coordinates did not go in. Tell me and I will fix it.


--------------------------------------------------------------------------------
STEP 7   Only if STEP 3 showed the local coordinates
--------------------------------------------------------------------------------
  Open GV_PLACE.lsp in Notepad. Near the top, change these two lines:

      (setq *GV-OFFE*  0.0)          ->   (setq *GV-OFFE*  -508213.73975)
      (setq *GV-OFFN*  0.0)          ->   (setq *GV-OFFN*  -2741920.16532)

  Save, then APPLOAD it again and run GVPLACEPOINTS.
  The callout text still shows the true survey coordinates; only where the
  blocks are placed changes.


--------------------------------------------------------------------------------
IF SOMETHING GOES WRONG
--------------------------------------------------------------------------------
  Type U once. That undoes the entire run.

  "Unknown command GVPLACEPOINTS"     -> STEP 5 did not work, it is not loaded.
  "Block COOR XY is not in this
   drawing"                           -> STEP 4 was skipped.
  Nothing visible after it runs       -> ZOOM E. If they are far away, STEP 7.
  Anything else                       -> press F2 to open the text window,
                                         copy the last few lines, send them.


--------------------------------------------------------------------------------
OTHER SETTINGS you can change at the top of GV_PLACE.lsp
--------------------------------------------------------------------------------
  (setq *GV-SCALE* 1.608006)   block insertion scale
  (setq *GV-ROT*   0.0000)     block rotation in degrees
  (setq *GV-PREC*  3)          decimal places in the N= / E= text
  (setq *GV-LABEL* nil)        change nil to T to also write GV1, GV2 ... as text
