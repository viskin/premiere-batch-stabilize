// Adds zoom effect to selected clip

// https://ppro-scripting.docsforadobe.dev/
// https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PPRO/Premiere.jsx

//@include "common.jsx"

var zoom = 1.1;
var zoomIn = true;
// setInterpolationTypeAtKey does not work for some reason
//var interpolationType = 5; // 5 = kfInterpMode_Bezier

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

if (selectedClips.length != 1) throw "Please select exactly one clip";

var clip = selectedClips[0];
var track = getTrackOfClip(videoTracks, clip);
var transitions = track.transitions;
var components = clip.components;

var motionComponent = getComponentByDisplayName(components, "Motion");

var scaleParam = getComponentParamByDisplayName(motionComponent.properties, "Scale");
if (!scaleParam.areKeyframesSupported()) throw "Keyframes are not supported for parameter " + scaleParam.displayName + " of component " + motionComponent.displayName;

var scale1 = scaleParam.getValue();
var scale2 = scale1 * zoom;
if (scale1 > scale2) {
    if (zoomIn) {
        var tmp = scale2;
        scale2 = scale1;
        scale1 = tmp;
    }
} else if (scale1 < scale2) {
    if (!zoomIn) {
        var tmp = scale2;
        scale2 = scale1;
        scale1 = tmp;
    }
}
var time1 = clip.inPoint;
var time2 = clip.outPoint;
//time1.seconds = 3601.06413333333;
//time2.seconds = 3601.7982;

scaleParam.setTimeVarying(true, 1);

scaleParam.addKey(time1, 1);
scaleParam.setValueAtKey(time1, scale1, 1); // 1 means updateUI
//scaleParam.setInterpolationTypeAtKey(time1, interpolationType, 1)

scaleParam.addKey(time2, 1);
scaleParam.setValueAtKey(time2, scale2, 1); // 1 means updateUI
//scaleParam.setInterpolationTypeAtKey(time2, interpolationType, 1)

function getSelectedClips(clips) {
    return clips.filter(function (clip) { return clip.isSelected() });
}
