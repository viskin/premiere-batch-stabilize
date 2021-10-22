// https://ppro-scripting.docsforadobe.dev/general/encoder.html
// https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PPRO/Premiere.jsx
// This process will create a lot of .prproj files in c:\Users\roman\AppData\Local\Temp\
// Requires exiftool to be evailable in Path

app.enableQE()

var outputDirectory = new File("h:\\Pictures\\tag\\stabilized\\");

if (!outputDirectory.exists) throw "Directory " + outputDirectory + " does not exist";

// Standard presets path : C:\\Program Files\\Adobe\\Adobe Premiere Pro 2021\\Settings\\IngestPresets\\Transcode\\
// Custom presets path   : D:\\Documents\\Adobe\\Adobe Media Encoder\\15.0\\Presets\\
//var encoderPresetFile = new File("C:\\Program Files\\Adobe\\Adobe Premiere Pro 2021\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr")
var encoderPresetFile = new File("D:\\Documents\\Adobe\\Adobe Media Encoder\\15.0\\Presets\\Copy of Match Source - High bitrate - Canon.epr")
if (!encoderPresetFile.exists) throw "Encoder preset " + encoderPresetPath + " does not exist"

app.encoder.launchEncoder()

var project = app.project
var projectItems = app.getCurrentProjectViewSelection()

if (!projectItems) throw "Please select some sequences"

var colorLabelExportStarted = 3; // Lavander
var colorLabelExportCompleted = 14; // Cerulean (light blue)
var colorLabelExiftoolApplied = 2; // Carribean

// 0 - started
// 1 - onEncoderJobComplete
// 2 - onEncoderJobQueued
// 3 - onEncoderJobError
var asyncStep = 0; 

//var outputPath  = Folder.selectDialog("That's how you choose directory");

for (var i = 0; i < projectItems.length; i++) {
    var projectItem = projectItems[i];

    if (projectItem.type === 1 // CLIP, BIN, ROOT, or FILE
        && projectItem.isSequence()) {
        var sequence = projectItemToSequence(projectItem);
        var videoTrack = sequence.videoTracks[0]
        var clip = videoTrack.clips[0]

        app.encoder.setEmbeddedXMPEnabled(1)
        app.encoder.setSidecarXMPEnabled(1)
        
        //var modifiedPresetFile = new File("E:\\dev\\AdobePremiere\\Test1\\preset.epr");
        //var encoderPreset = app.encoder.getPresetObject(encoderPresetFile.fsName);
        //encoderPreset.setExportParamValue("IngestMetadataEnabled", "true")
        //encoderPreset.setExportParamValue("ADBEVideoTargetBitrate", "20")
        //encoderPreset.writeToFile(modifiedPresetFile.fsName);

        //app.encoder.exportWithPresetObject(encoderPreset, sequence)

        var inputPath = clip.projectItem.getMediaPath();
        var outputPath = outputDirectory.fsName + "\\" + clip.name;

        //  sequence.exportAsMediaDirect(outputPath,
        //     encoderPresetFile.fsName,
        //      app.encoder.ENCODE_ENTIRE);

        app.encoder.bind('onEncoderJobComplete', function (jobID, outputFilePath) { onEncoderJobComplete2(jobID, outputFilePath, inputPath, sequence) });
        app.encoder.bind('onEncoderJobQueued', onEncoderJobQueued);
        app.encoder.bind('onEncoderJobError', onEncoderJobError);

        asyncStep = 0;

        app.setSDKEventMessage("Exporting " + sequence.name, "info");

        // https://ppro-scripting.docsforadobe.dev/general/encoder.html?highlight=encodesequence
        var jobId = app.encoder.encodeSequence(
            sequence,
            outputPath,
            /*modifiedPresetFile.fsName*/encoderPresetFile.fsName,
            app.encoder.ENCODE_ENTIRE,
            0, // removeUponCompletion
        )
        
        if (jobId === 0) throw "encodeSequence returned 0"

        sequence.projectItem.setColorLabel(colorLabelExportStarted)

        app.encoder.startBatch()
        
        while (asyncStep === 0) {
            $.sleep(1000);
        }

        app.encoder.unbind('onEncoderJobComplete');
        app.encoder.unbind('onEncoderJobQueued');
        app.encoder.unbind('onEncoderJobError');
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

// onEncoderJobComplete with inputPath parameter
function onEncoderJobComplete2(jobID, outputFilePath, inputPath, sequence) {
    sequence.projectItem.setColorLabel(colorLabelExportCompleted);
    var result = copyMetadata(inputPath, outputFilePath);
    if (result) sequence.projectItem.setColorLabel(colorLabelExiftoolApplied);

    asyncStep = 2;
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

    asyncStep = 3;
}

function run(cmd) {
    var f = new File(Folder.temp.fsName + "\\premiererun-" + generateJsUUID() + ".bat");
    f.encoding = "UTF8";
    f.open("w");
    f.writeln("chcp 65001\n" + cmd /*+ "\npause"*/);
    f.close();
    return f.execute();
    //f.remove(); // TODO: should wait for execute to finish
}

// JS - Generate Global Random Unique Number
function generateJsUUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

// args should be separated with \n
function runExifTool(args) {
    var f = new File(Folder.temp.fsName + "\\premiererunargs-" + generateJsUUID() + ".txt");
    f.encoding = "UTF8";
    f.open("w");
    f.writeln(args);
    f.close();
    return run("exiftool -@ " + f.fsName)
}

// supports unicode filenames
function copyMetadata(source, target) {
    //run("exiftool -tagsfromfile \"" + source + "\" \"" + target + "\" -overwrite_original -charset filename=utf8");
    return runExifTool("-tagsfromfile\n" + source + "\n" + target + "\n-overwrite_original\n-charset\nfilename=utf8")
}