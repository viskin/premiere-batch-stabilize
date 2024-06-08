// Adds zoom effect to selected clip
// Useful for blinging life to photo still.
// Set zoomIn to true, false or null (random).
// Select some clips, and run the script.

// https://ppro-scripting.docsforadobe.dev/
// https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PPRO/Premiere.jsx

//@include "common.jsx"

var zoom = 1.05; // > 1.0
var zoomIn = null; // true, false or null. null means random
var interpolationType = 5; // 5 = kfInterpMode_Bezier

var project = app.project;

var sequence = project.activeSequence;

if (!sequence) throw "Please select a sequence";

var videoTracks = sequence.videoTracks;

var selectedClips = [];

for (var trackIndex = 0; trackIndex < videoTracks.numTracks; trackIndex++) {
    var track = videoTracks[trackIndex];
    var clips = collectionToArray(track.clips);
    selectedClips.push.apply(selectedClips, getSelectedClips(clips));
}

if (selectedClips.length == 0) throw "Please select some clips";

for (var clipIndex = 0; clipIndex < selectedClips.length; clipIndex++) {
    
    var clip = selectedClips[clipIndex];

    var track = getTrackOfClip(videoTracks, clip);
    var transitions = track.transitions;
    var components = clip.components;

    var motionComponent = getComponentByDisplayName(components, "Motion");

    var scaleParam = getComponentParamByDisplayName(motionComponent.properties, "Scale");
    if (!scaleParam.areKeyframesSupported()) throw "Keyframes are not supported for parameter " + scaleParam.displayName + " of component " + motionComponent.displayName;

    var currentZoomIn = zoomIn === null ? Math.random() < 0.5 : zoomIn;
    var scale1 = currentZoomIn ? scaleParam.getValue() : scaleParam.getValue() * zoom;
    var scale2 = currentZoomIn                ? scale1 * zoom : scale1 / zoom;

    var time1 = clip.inPoint;
    var time2 = new Time();
    time2.seconds = clip.outPoint.seconds - 0.0000001; // to make video frame visible

    scaleParam.setTimeVarying(true, 1);

    scaleParam.addKey(time1, 1);
    scaleParam.setValueAtKey(time1, scale1, 1); // 1 means updateUI
    scaleParam.setInterpolationTypeAtKey(time1, interpolationType, 1)

    scaleParam.addKey(time2, 1);
    scaleParam.setValueAtKey(time2, scale2, 1); // 1 means updateUI
    scaleParam.setInterpolationTypeAtKey(time2, interpolationType, 1)

    app.setSDKEventMessage("Scale effect applied to " + clip.name, "info");
}
    
function getSelectedClips(clips) {
    return clips.filter(function (clip) { return clip.isSelected() });
}
