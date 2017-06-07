function SongLoader() {
  const notes = ["F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];
  const randomSongLength = 10;

  const songs = {
    "Random": Array.apply(null, Array(randomSongLength)).map(function() {
        return [notes[randInt(0, notes.length - 1, true)], 1]
    }),
    "Happy Birthday": parseSong("0,4-0,8-2,4-4,4-4,4-4,2"),
    "Happy Birthday V2": parseSongDashed("0-0-2--0--5-4----0-0-2--0----7-5----0-0-9--7-5-4--2-2----10-10-9--5--7-5"),
    "Guess what": parseSongDashed("0--3--5---0--3--6--5---0--3--5---3--0"),
  }

  function parseSong(encodedSong) {
    return encodedSong.split("-").map(function(fretDurationPair) {
      var [fret, duration] = fretDurationPair.split(",").map(function(el) {
        return parseInt(el, 10);
      });

      var note = fret === 0 ? "E" : notes[fret - 1];

      return [note, duration];
    });
  }
  
  function parseSongDashed(encodedSong) {
    const notes = ["F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];
    let song = [];
    let duration = 0;
    let last_note;
    for (let i = 0; i < encodedSong.length; i++){
      if (encodedSong[i] != "-"){
        if (duration > 0){
          song.push([last_note, 8 / duration]);
        }

        let fret = parseInt(encodedSong[i]);
        last_note = fret === 0 ? "E" : notes[fret - 1];
        duration = 0;
      } else {
        duration += 1;
      }
    }
    song.push([last_note, 8/8.0]);
    return song;
  }


  return {
    songs: songs,
    notes: notes,
    findNoteIndex: function(note) {
      return notes.findIndex(function(n) {
        return note === n;
      });
    },
    populateSelectMenu: function($songSelect) {
      for(song in songs) {
        var $option = $("<option/>");
        $option.val(song);
        $option.text(song);

        if(song === "Random") {
          $option.attr("selected", "selected");
        }

        $songSelect.append($option);
      }
    }
  }
}
