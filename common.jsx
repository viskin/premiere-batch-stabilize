function collectionToArray(collection) {
    var arr = [];
    for (var i = 0; i < collection.length; i++) {
        arr.push(collection[i]);
    }
    return arr;
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

function getComponentParamByDisplayName(componentProperties, name) {
    for (var i = 0; i < componentProperties.length; i++) {
        var property = componentProperties[i];
        if (name === property.displayName) {
            return property;
        }
    }
    return null;
}

function getTrackOfClip(tracks, clip) {
    for (var trackIndex = 0; trackIndex < tracks.numTracks; trackIndex++) {
        var track = tracks[trackIndex];

        for (var clipIndex = 0; clipIndex < track.clips.length; clipIndex++) {
            if (track.clips[clipIndex].nodeId === clip.nodeId) return track;
        }
    }
    return null;
}