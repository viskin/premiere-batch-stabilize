// Creates sequences for all selected project files
// https://ppro-scripting.docsforadobe.dev/

var project = app.project
//app.getWorkspaces() // All Panels,Assembly,Audio,Captions,Color,Editing,Effects,Graphics,Learning,Libraries,Metalogging,Production
//app.trace("AAA")
var projectItems = app.getCurrentProjectViewSelection()

if (!projectItems) throw "Please select some files"

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];
    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && !projectItem.isSequence()) {
        //app.trace(projectItem.name);
        project.createNewSequenceFromClips(projectItem.name, [projectItem])
    }
}

app.setSDKEventMessage("Done", "info");
