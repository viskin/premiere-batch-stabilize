// Apply effect
// https://ppro-scripting.docsforadobe.dev/
// qe.reflect.methods
// qe.reflect.properties

//https://lesterbanks.com/2019/04/how-to-add-effects-in-premiere-with-extendscript/

//https://github.com/qmasingarbe/pymiere/blob/master/example_and_documentation.md - how to export
//https://github.com/yearbook/yearbook.github.io/blob/master/esdocs/source/Premiere/classes/QEProject.json - parameters

//@include "common.jsx"

var effectName = "Warp Stabilizer" // Sadly cannot be a preset name
var smoothness = 9;
var cropLessSmoothMore = 10;

app.enableQE();

var project = app.project;
var projectItems = app.getCurrentProjectViewSelection();

if (!projectItems) throw "Please select some sequences";

var colorLabelEffectAdded = 7; // dark yellow
var colorLabelEffectConfigured = 12; // biege
var colorLabelEffectAnalyzed = 10; // dark green

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        app.trace(sequence.name);
        var videoTrack = sequence.videoTracks[0]
        var clip = videoTrack.clips[0]
        var components = clip.components;
        //components[0].displayName

        var qsequence = sequenceToQSequence(sequence);
        var qclip = qsequence.getVideoTrackAt(0).getItemAt(0);

        var effectComponent = getComponentByDisplayName(components, effectName);

        if (!effectComponent) { // Add effect it not exists
            qe.project.getVideoEffectList()
            var effect = qe.project.getVideoEffectByName(effectName);
            if (!effect.name) throw "Effect now found: " + effectName;
            app.trace(effect.name);
            qclip.addVideoEffect(effect);
            sequence.projectItem.setColorLabel(colorLabelEffectAdded);

            effectComponent = getComponentByDisplayName(components, effectName);
        }

        applyEffectProperties(effectComponent);

        sequence.projectItem.setColorLabel(colorLabelEffectConfigured);

        app.setSDKEventMessage("Started " + effectName + " to " + sequence.name , "info");

        do {
            $.sleep(1000);
        } while (!sequence.isDoneAnalyzingForVideoEffects());

        app.setSDKEventMessage("Completed " + effectName + " to " + sequence.name , "info");

        sequence.projectItem.setColorLabel(colorLabelEffectAnalyzed);
    }

    app.project.save();

}

app.setSDKEventMessage("Done", "info");

function projectItemToSequence(projectItem) {
    for (var i = 0; i < app.project.sequences.numSequences; i++) {
        if (projectItem.nodeId === app.project.sequences[i].projectItem.nodeId) {
            return app.project.sequences[i];
        }
    }
    return null;
}

function sequenceToQSequence(sequence) {
    for (var i = 0; i < qe.project.numSequences; i++) {
        // TODO: when sequences are put into a bin, this fails
        var qsequence = qe.project.getSequenceAt(i);
        if (qsequence.guid === sequence.sequenceID) {
            return qsequence;
        }
    }
    return null;
}

function applyEffectProperties(component) {
    if (!component) return;
    for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i];
        switch (property.displayName) {
            case "Smoothness":
                property.setValue(smoothness, 1); // 1 means update gui
                break;
            case "Crop Less <-> Smooth More":
                property.setValue(cropLessSmoothMore, 1); // 1 means update gui
                break;
        }
    }
}