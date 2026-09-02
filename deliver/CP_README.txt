================================================================================
  CP - coordinate callouts
================================================================================

One command:  CP

  Type       key in a coordinate as N= and E=, and place it
  Pick       click a point, and it reads the coordinate for you
  List       place a whole CSV at once
  Calibrate  click a callout you already have, and it copies everything
  Settings   change anything by hand


--------------------------------------------------------------------------------
FIRST TIME IN A DRAWING
--------------------------------------------------------------------------------
  APPLOAD -> CP.lsp -> Load

  Command: CP
  Place a coordinate [Type/Pick/List/Calibrate/Settings/Help]: C

  Select one coordinate callout you already have:  (click one)

      --- learned from that callout ---
        Block        COOR XY
        Scale        1.608006    Rotation 0.000
        Northing     N=  to 3 decimals   e.g. N=2744292.332
        Easting      E=                  e.g. E=478042.125
        Coordinates  the drawing is on the survey grid

  That is the whole setup. It works out the block, its scale and rotation,
  which attribute holds the northing, your exact wording, how many decimals
  you use, and whether the drawing sits on the survey grid - all from one
  callout you already made. Nothing to fill in.

  Settings are saved in the drawing, so they travel with the DWG.


--------------------------------------------------------------------------------
TYPING A COORDINATE
--------------------------------------------------------------------------------
  Command: CP        (Enter accepts Type)

  Northing N= (or paste both N and E, . to cancel):

  Paste whatever you have. All of these work:

      N=2744292.332 E=478042.125
      E=478042.125 N=2744292.332
      N= 2744292.332 , E= 478042.125
      2744292.332 478042.125
      2744292.332                     (it then asks for the easting)

  Tag <GV1>  (. for none):            Enter accepts, or type your own
  Pick where the callout goes:        Enter puts it on the coordinate itself

  The tag counts up on its own - GV1, GV2, GV3 - so you can keep going
  without retyping it. It handles leading zeros too: BV08 -> BV09.

  It keeps asking until you answer the northing with a full stop, so a run
  of points is quick.


--------------------------------------------------------------------------------
THE TAG ABOVE THE CALLOUT
--------------------------------------------------------------------------------
  The tag is written above the callout box, at the same text height and
  rotation as the callout's own text. The position is taken from the block's
  attributes each time, so it lands correctly whatever block you use.

  Tags go on their own layer (CP-TAG by default) so they can be turned off
  or deleted without touching the callouts.

  Do not want tags?   CP -> Settings -> "Write a tag above each callout" -> N


--------------------------------------------------------------------------------
CLICKING INSTEAD OF TYPING
--------------------------------------------------------------------------------
  Command: CP  ->  P

  Pick the point to annotate:         it reads and shows the coordinate
  Tag <GV2>:
  Pick where the callout goes:

  Useful for annotating something already drawn.


--------------------------------------------------------------------------------
A WHOLE LIST AT ONCE
--------------------------------------------------------------------------------
  Command: CP  ->  L        then choose your CSV

  The CSV needs a header row. Column order does not matter and extra
  columns are ignored:

      POINTS,EASTING,NORTHING
      GV1,478042.125,2744292.332
      GV2,477976.834,2744283.671

  Headers it recognises:  POINT / NAME / TAG / ID,  EASTING / E / X,
                          NORTHING / N / Y


--------------------------------------------------------------------------------
IF THINGS GO WRONG
--------------------------------------------------------------------------------
  U                             undoes an entire CP run in one step.

  "The callout block ... is not in this drawing"
                                insert one copy of your callout block, or
                                run CP -> Calibrate and click one.

  "nothing was written - run CPCAL"
                                the block was placed but its attributes were
                                not recognised. Calibrate on a filled-in one.

  Coordinates land far away      the drawing is not on the survey grid.
                                Calibrate on a callout in THIS drawing and
                                the offset is worked out for you.


--------------------------------------------------------------------------------
COMMANDS
--------------------------------------------------------------------------------
  CP        everything
  CPCAL     calibrate directly
  CPSET     settings directly
