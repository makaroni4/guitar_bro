// https://github.com/GoogleChrome/guitar-tuner
function AudioProcessor() {
  this.FFTSIZE = 2048;
  this.stream = null;
  this.audioContext = new AudioContext();
  this.analyser = this.audioContext.createAnalyser();
  this.gainNode = this.audioContext.createGain();
  this.microphone = null;

  this.gainNode.gain.value = 0;
  this.analyser.fftSize = this.FFTSIZE;
  this.analyser.smoothingTimeConstant = 0;

  this.frequencyBufferLength = this.FFTSIZE;
  this.frequencyBuffer = new Float32Array(this.frequencyBufferLength);

  this.sendingAudioData = false;

  this.lastRms = 0;
  this.rmsThreshold = 0.006;
  this.assessedStringsInLastFrame = false;
  this.assessStringsUntilTime = 0;

  var that = this;

  this.requestUserMedia = function () {
    var that = this;

    navigator.getUserMedia({audio:true}, (stream) => {
      that.sendingAudioData = true;
      that.stream = stream;
      that.microphone = that.audioContext.createMediaStreamSource(stream);
      that.microphone.connect(that.analyser);
      that.analyser.connect(that.gainNode);
      that.gainNode.connect(that.audioContext.destination);

      requestAnimationFrame(that.dispatchAudioData);

    }, (err) => {
      console.log('Unable to access the microphone');
      console.log(err);
    });
  }

  this.attached = function() {
    // Set up the stream kill / setup code for visibility changes.
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Then call it.
    this.onVisibilityChange();
  }

  this.detached = function() {
    this.sendingAudioData = false;
  }

  this.onVisibilityChange = function() {
    if (document.hidden) {
      this.sendingAudioData = false;

      if (this.stream) {
        // Chrome 47+
        this.stream.getAudioTracks().forEach((track) => {
          if ('stop' in track) {
            track.stop();
          }
        });

        // Chrome 46-
        if ('stop' in this.stream) {
          this.stream.stop();
        }
      }

      this.stream = null;
    } else {
      this.requestUserMedia();
    }

  }

  /**
   * Autocorrelate the audio data, which is basically where you
   * compare the audio buffer to itself, offsetting by one each
   * time, up to the half way point. You sum the differences and
   * you see how small the difference comes out.
   */
  this.autocorrelateAudioData = function(time) {
    let searchSize = that.frequencyBufferLength * 0.5;
    let sampleRate = that.audioContext.sampleRate;
    let offsetKey = null;
    let offset = 0;
    let difference = 0;
    let tolerance = 0.001;
    let rms = 0;
    let rmsMin = 0.008;
    let assessedStringsInLastFrame = that.assessedStringsInLastFrame;

    // Fill up the data.
    that.analyser.getFloatTimeDomainData(that.frequencyBuffer);

    // Figure out the root-mean-square, or rms, of the audio. Basically
    // this seems to be the amount of signal in the buffer.
    for (let d = 0; d < that.frequencyBuffer.length; d++) {
      rms += that.frequencyBuffer[d] * that.frequencyBuffer[d];
    }

    rms = Math.sqrt(rms / that.frequencyBuffer.length);

    // If there's little signal in the buffer quit out.
    if (rms < rmsMin)
      return 0;

    // Only check for a new string if the volume goes up. Otherwise assume
    // that the string is the same as the last frame.
    if (rms > that.lastRms + that.rmsThreshold) {
      that.assessStringsUntilTime = time + 250;
    }

    that.assessedStringsInLastFrame = time < that.assessStringsUntilTime;

    // Next for the top candidate in the set, figure out what
    // the actual offset is from the intended target.
    // We'll do it by making a full sweep from offset - 10 -> offset + 10
    // and seeing exactly how long it takes for that wave to repeat itself.
    // And that will be our *actual* frequency.
    let searchStart = 20;
    let searchEnd = 600;
    let actualFrequency = 0;
    let smallestDifference = Number.POSITIVE_INFINITY;

    for (let s = searchStart; s < searchEnd; s++) {

      difference = 0;

      // For each iteration calculate the difference of every element of the
      // array. The data in the buffer should be PCM, so values ranging
      // from -1 to 1. If they match perfectly then they'd essentially
      // cancel out. But that is real data so we'll be looking for small
      // amounts. If it's below tolerance assume a perfect match, otherwise
      // go with the smallest.
      //
      // A better version of that would be to curve match on the data.
      for (let i = 0; i < searchSize; i++) {
        difference += Math.abs(that.frequencyBuffer[i] - that.frequencyBuffer[i + s]);
      }

      difference /= searchSize;

      if (difference < smallestDifference) {
        smallestDifference = difference;
        actualFrequency = s;
      }

      if (difference < tolerance) {
        actualFrequency = s;
        break;
      }
    }

    that.lastRms = rms;

    return that.audioContext.sampleRate / actualFrequency;
  }

  this.dispatchAudioData = function(time) {

    // Always set up the next pass here, because we could
    // early return from this pass if there's not a lot
    // of exciting data to deal with.
    if (that.sendingAudioData) {
      requestAnimationFrame(that.dispatchAudioData);
    }

    let frequency = that.autocorrelateAudioData(time);

    if (frequency === 0) {
      return;
    }

    // Convert the most active frequency to linear, based on A440.
    let dominantFrequency = Math.log2(frequency / 440);

    // Figure out how many semitones that equates to.
    let semitonesFromA4 = 12 * dominantFrequency;

    // The octave is A440 for 4, so start there, then adjust by the
    // number of semitones. Since we're at A, we need only 3 more to
    // push us up to octave 5, and 9 to drop us to 3. So there's the magic
    // 9 in that line below accounted for.
    let octave = 4 + ((9 + semitonesFromA4) / 12);
    octave = Math.floor(octave);

    // The note is 0 for A, all the way to 11 for G#.
    let note = (12 + (Math.round(semitonesFromA4) % 12)) % 12;

    // Now tell anyone who's interested.
    let notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

    console.log([frequency, octave, note]);
  }
}

$(function() {
  var processor = new AudioProcessor();
  processor.attached();
})
