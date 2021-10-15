// https://ppro-scripting.docsforadobe.dev/general/encoder.html
// https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PPRO/Premiere.jsx

app.enableQE()

var outputDirectory = new File("E:\\dev\\AdobePremiere\\Test1\\render\\");
if (!outputDirectory.exists) throw "Directory " + outputDirectory + " does not exist";

// Standard presets path : C:\\Program Files\\Adobe\\Adobe Premiere Pro 2021\\Settings\\IngestPresets\\Transcode\\
// Custom presets path   : D:\\Documents\\Adobe\\Adobe Media Encoder\\15.0\\Presets\\
//var encoderPresetFile = new File("C:\\Program Files\\Adobe\\Adobe Premiere Pro 2021\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr")
var encoderPresetFile = new File("D:\\Documents\\Adobe\\Adobe Media Encoder\\15.0\\Presets\\Copy of Match Source - High bitrate - Canon.epr")
if (!encoderPresetFile.exists) throw "Encoder preset " + encoderPresetPath + " does not exist"

app.encoder.launchEncoder()

var project = app.project
var projectItems = app.getCurrentProjectViewSelection()

if (!projectItem) throw "Please select some sequences"

//var outputPath  = Folder.selectDialog("That's how you choose directory");

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        var videoTrack = sequence.videoTracks[0]
        app.setSDKEventMessage('Here is some information.', 'info');
        var clip = videoTrack.clips[0]

        app.encoder.setEmbeddedXMPEnabled(1)
        app.encoder.setEmbeddedXMPEnabled(1)
        
        //var modifiedPresetFile = new File("E:\\dev\\AdobePremiere\\Test1\\preset.epr");
        //var encoderPreset = app.encoder.getPresetObject(encoderPresetFile.fsName);
        //encoderPreset.setExportParamValue("IngestMetadataEnabled", "true")
        //encoderPreset.setExportParamValue("ADBEVideoTargetBitrate", "20")
        //encoderPreset.writeToFile(modifiedPresetFile.fsName);

        //app.encoder.exportWithPresetObject(encoderPreset, sequence)

        var outputPath = outputDirectory.fsName + "\\" + clip.name;

        //  sequence.exportAsMediaDirect(outputPath,
        //     encoderPresetFile.fsName,
        //      app.encoder.ENCODE_ENTIRE);

        app.encoder.bind('onEncoderJobQueued', onEncoderJobQueued);
        app.encoder.bind('onEncoderJobError', onEncoderJobError);

        // https://ppro-scripting.docsforadobe.dev/general/encoder.html?highlight=encodesequence
        var jobId = app.encoder.encodeSequence(
            sequence,
            outputPath,
            /*modifiedPresetFile.fsName*/encoderPresetFile.fsName,
            app.encoder.ENCODE_ENTIRE,
            0, // removeUponCompletion
        )
        
        if (jobId === 0) throw "encodeSequence returned 0"

        //app.encoder.startBatch()
    }

    encoderPresetFile.close()

}

function projectItemToSequence(projectItem) {
    for (var i = 0; i < app.project.sequences.numSequences; i++) {
        if (projectItem.nodeId === app.project.sequences[i].projectItem.nodeId) {
            return app.project.sequences[i];
        }
    }
    return null;
}

function onEncoderJobQueued (jobID) {
    //app.encoder.startBatch();
}

function onEncoderJobError (jobID, errorMessage) {
    var eoName; 

    if (Folder.fs === 'Macintosh') {
        eoName	= "PlugPlugExternalObject";							
    } else {
        eoName	= "PlugPlugExternalObject.dll";
    }
            
    var mylib		= new ExternalObject('lib:' + eoName);
    var eventObj	= new CSXSEvent();

    eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
    eventObj.data	= "Job " + jobID + " failed, due to " + errorMessage + ".";
    eventObj.dispatch();
}