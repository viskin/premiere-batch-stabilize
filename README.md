# Adobe Premiere batch video stabilization

This script allowed me to create automatic stabilization pipeline with Adobe Premiere.

As a bonus, it uses exiftool to copy all the metadata Adobe Premiere fails to copy to the stabilized video.

## Preparation

Tested on Windows.

You will need
- VS Code with **ExtendScript Debugger** extension from Adobe.
- exiftool - download and put exiftool.exe in some folder accessible with PATH.

## Usage

- Create new Premiere project
- Drag some movie files to the project
- Now you need to create a sequence for each move
    - Select needed movies in project panel
    - Run `create-sequences.jsx`
    - You can customize target BIN by modifying `targetBinName` variable
- Now you apply `Warp Stabilizer` effect for each sequence
    - Select needed sequences
    - Run `apply-warp-effect.jsx`
    - You can customize smoothness and cropLessSmoothMore of Warp Stabilizer effect by modifying the script
    - On each starge, color label of the sequence will be modified for convenience, as process can take long, and can fail in the middle
- As the effect applied, we want to export all the sequences
    - Create a preset for export, e.g. "Copy of Match Source - High bitrate - Canon"
    - The script will only work with custom preset
    - Select needed sequences
    - Run `export.jsx`
    - You can modify outputDirectory by modifying the script
    - Modify presetName in the script to match your preset
