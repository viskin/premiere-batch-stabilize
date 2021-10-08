// Apply filter
// https://ppro-scripting.docsforadobe.dev/
// qe.reflect.methods
// qe.reflect.properties

var presetName = "Warp Stabilizer 20%" // Can be effect / preset name

app.enableQE()

var project = app.project
var projectItems = app.getCurrentProjectViewSelection()
for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        var sequenceIndex = projectItemToSequenceIndex(projectItem);
        app.trace(sequence.name);
        var videoTrack = sequence.videoTracks[0]
        var clip = videoTrack.clips[0]
        var components = clip.components;
        //components[0].displayName

        var qsequence = qe.project.getSequenceAt(sequenceIndex)
        var qclip = qsequence.getVideoTrackAt(0).getItemAt(0)

        //qe.project.getVideoEffectList()
        var effect = qe.project.getVideoEffectByName(presetName)
        app.trace(effect.name)
        qclip.addVideoEffect(effect)

        // TODO: wait for 
        //sequence.isDoneAnalyzingForVideoEffects()
        
    }

}

function projectItemToSequence(projectItem) {
    for (var i = 0; i < app.project.sequences.numSequences; i++) {
        if (projectItem.nodeId === app.project.sequences[i].projectItem.nodeId) {
            return app.project.sequences[i];
        }
    }
    return null;
}

function projectItemToSequenceIndex(projectItem) {
    for (var i = 0; i < app.project.sequences.numSequences; i++) {
        if (projectItem.nodeId === app.project.sequences[i].projectItem.nodeId) {
            return i;
        }
    }
    return null;
}
