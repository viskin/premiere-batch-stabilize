// Creates sequences for all selected project files
// https://ppro-scripting.docsforadobe.dev/

var targetBinName = "stabilize"; // empty string for none

var project = app.project;

var projectItems = app.getCurrentProjectViewSelection();

if (!projectItems) throw "Please select some files";

var targetBin = targetBinName && getBin(targetBinName);
if (targetBinName && !targetBin) targetBin = project.rootItem.createBin(targetBinName);

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];
    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && !projectItem.isSequence()) {
        if (targetBin) {
            project.createNewSequenceFromClips(projectItem.name, [projectItem], targetBin);
        } else {
            project.createNewSequenceFromClips(projectItem.name, [projectItem]);
        }
    }
}

app.setSDKEventMessage("Done", "info");

function getBin(name, root) {
    if (!root) root = app.project.rootItem;
    var projectItems = root.children;
    for (var i = 0; i < projectItems.length; i++) {
        var projectItem = projectItems[i];
        if (projectItem.type === 2 && !projectItem.isSequence()) { // BIN
            if (projectItem.name === name) return projectItem;
            var innerItem = getBin(name, projectItem);
            if (innerItem) return innerItem;
        }
    }
    return null;
}