//app.enableQE()

app.encoder.launchEncoder()

var project = app.project
var projectItems = app.getCurrentProjectViewSelection()

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        var videoTrack = sequence.videoTracks[0]
        var clip = videoTrack.clips[0]

        app.encoder.setEmbeddedXMPEnabled(true)
        var encoderPresetPath = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2021\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr";
        var modifiedPresetPath = "E:\\dev\\AdobePremiere\\Test1\\preset.epr"

        var encoderPreset = app.encoder.getPresetObject(encoderPresetPath);
        encoderPreset.setExportParamValue("IngestMetadataEnabled", "true")

        encoderPreset.writeToFile(modifiedPresetPath)

        //app.encoder.exportWithPresetObject(encoderPreset, sequence)

        // https://ppro-scripting.docsforadobe.dev/general/encoder.html?highlight=encodesequence
        var jobId = app.encoder.encodeSequence(
            sequence,
            "E:\\dev\\AdobePremiere\\Test1\\render\\" + clip.name,
            modifiedPresetPath,
            app.encoder.ENCODE_ENTIRE,
            0, // removeUponCompletion
        )
        
        if (jobId === 0) throw "encodeSequence returned 0"

        //app.encoder.startBatch()
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
