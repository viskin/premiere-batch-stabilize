// Moves keyframes to closer corners

// https://ppro-scripting.docsforadobe.dev/
// https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PPRO/Premiere.jsx

//@include "common.jsx"

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

    for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
        var component = components[componentIndex];

        for (var propertyIndex = 0; propertyIndex < component.properties.length; propertyIndex++) {
            var property = component.properties[propertyIndex];
            if (property.areKeyframesSupported()) {
                var start = clip.inPoint.seconds;
                var end = clip.outPoint.seconds - 0.0000001; // to make video frame visible
                var middle = (start + end) / 2;
                var keys = property.getKeys();
                if (keys) {
                    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                        var key = keys[keyIndex];
                        if (key.seconds === start || key.seconds === end) continue;
                        if (key.seconds < middle) {
                            property.addKey(start, 1);
                            property.setValueAtKey(start, property.getValueAtKey(key));
                        } else {
                            property.addKey(end, 1);
                            property.setValueAtKey(end, property.getValueAtKey(key));
                        }
                        property.removeKey(key);
                    }
                }
            }
        }
    }

    app.setSDKEventMessage("Align keyframe applied to " + clip.name, "info");
}
    
function getSelectedClips(clips) {
    return clips.filter(function (clip) { return clip.isSelected() });
}
