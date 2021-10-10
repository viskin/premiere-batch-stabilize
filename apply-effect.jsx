// Apply effect
// https://ppro-scripting.docsforadobe.dev/
// qe.reflect.methods
// qe.reflect.properties

//https://lesterbanks.com/2019/04/how-to-add-effects-in-premiere-with-extendscript/

//https://github.com/qmasingarbe/pymiere/blob/master/example_and_documentation.md - how to export
//https://github.com/yearbook/yearbook.github.io/blob/master/esdocs/source/Premiere/classes/QEProject.json - parameters

var effectName = "Warp Stabilizer" // Sadly cannot be a preset name

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

        var effectComponent = getComponentByDisplayName(components, effectName)

        if (!effectComponent) { // Add effect it not exists
            //qe.project.getVideoEffectList()
            var effect = qe.project.getVideoEffectByName(effectName)
            if (!effect.name) throw "Effect now found: " + effectName;
            app.trace(effect.name)
            qclip.addVideoEffect(effect)

            effectComponent = getComponentByDisplayName(components, effectName)
        }

        applyEffectProperties(effectComponent)

        // TODO: wait for 
        var done = sequence.isDoneAnalyzingForVideoEffects()
        
        var a = 1;
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

function getComponentByDisplayName(components, name) {
    for (var i = 0; i < components.length; i++) {
        var component = components[i];
        if (name === component.displayName) {
            return component;
        }
    }
    return null;
}

function applyEffectProperties(component) {
    for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i];
        switch (property.displayName) {
            case "Smoothness":
                property.setValue(9, 1); // 1 means update gui
                break;
            case "Crop Less <-> Smooth More":
                property.setValue(10, 1); // 1 means update gui
                break;
        }
    }
}