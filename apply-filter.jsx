// Apply filter
// https://ppro-scripting.docsforadobe.dev/

var project = app.project
var projectItems = app.getCurrentProjectViewSelection()
for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        app.trace(sequence.name);
        app.trace(sequence.sequenceID)
        //project.createNewSequenceFromClips(projectItem.name, [projectItem])
    }

}

function projectItemToSequence(projectItem) {
    for (var i = 0; i < app.project.sequences.numSequences; i++){
        if (projectItem.nodeId === app.project.sequences[i].projectItem.nodeId){
            return app.project.sequences[i];
        }
    }
    return null;
}
