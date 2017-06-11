const Strings = {
  1: {
    range : [325, 665],
    freqs: [
        [329.6, "E"],
        [349.2, "F"],
        [370.0, "F#"],
        [392.0, "G"],
        [415.3, "G#"],
        [440.0, "A"],
        [466.1, "A#"],
        [493.8, "B"],
        [523.2, "C"],
        [554.3, "C#"],
        [587.3, "D"],
        [622.2, "D#"],
        [659.2, "E"],
      ]
    },

  6: {
    range : [75, 170],
    freqs : [
      [82.4, "E"],
      [87.3, "F"],
      [92.5, "F#"],
      [98.0, "G"],
      [103.8, "G#"],
      [110.0, "A"],
      [116.5, "A#"],
      [123.5, "B"],
      [130.8, "C"],
      [138.6, "C#"],
      [146.8, "D"],
      [155.6, "D#"],
      [164.8, "E"],
      ]
  }
}

// https://github.com/GoogleChrome/guitar-tuner
function AudioProcessor() {
  this.FFTSIZE = 2048 * 4;
  this.stream = null;
  this.audioContext = new AudioContext();
  this.analyser = this.audioContext.createAnalyser();
  this.gainNode = this.audioContext.createGain();
  this.microphone = null;

  this.gainNode.gain.value = 0;
  this.analyser.fftSize = this.FFTSIZE;
  this.analyser.smoothingTimeConstant = 0.1;

  this.frequencyBufferLength = this.FFTSIZE;
  this.frequencyBuffer = new Float32Array(this.frequencyBufferLength / 2);
  this.timeBuffer = new Float32Array(this.frequencyBufferLength);

  this.sendingAudioData = false;

  this.lastNoteEnergy = 0;
  this.wave_power_threshold = 0.006;
  this.last_note_time = -1;

  var audioWaveChart = new AudioWaveChart();

  var string;
  var that = this;

  this.requestUserMedia = function () {
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

  this.setString = function(string_num){
    string = Strings[string_num];
  }

  this.findNoteFreq = function(time) {
    let freq_step = that.audioContext.sampleRate / this.FFTSIZE;
    let min_freq_ind = Math.round(string.range[0] / freq_step);
    let max_freq_ind = Math.round(string.range[1] / freq_step);

    // Fill up the data.

    that.analyser.getFloatTimeDomainData(that.timeBuffer);
    that.analyser.getFloatFrequencyData(that.frequencyBuffer);
    freq = that.frequencyBuffer;
    wave = that.timeBuffer;

    audioWaveChart.plotWave(wave);

    for (let d = Math.round(Math.max(min_freq_ind - 20 / freq_step - 5, 0)); d < Math.min(max_freq_ind + 20 / freq_step + 5, freq.length); d++) {
      freq[d] = Math.pow(10, 5 + freq[d] / 10);
    }


    let max_A = -1000000;
    let arg_max = -1;
    for (let i = min_freq_ind; i < max_freq_ind; i++) {
      if (freq[i] > max_A){
        max_A = freq[i];
        arg_max = i;
      }
    }

    let total_energy = 0;
    for (let i = min_freq_ind; i < max_freq_ind; i++) {
      total_energy += freq[i];
    }

    let maximum_energy = 0;
    for (let i = Math.round(arg_max - 20 / freq_step - 1); i <= Math.round(arg_max + 20 / freq_step + 1); i++){
      maximum_energy += freq[i];
    }

    if (maximum_energy < 0.1 || maximum_energy / total_energy < 0.96){
      return -1;
    }

    if (time > this.last_note_time + 100){
      this.lastNoteEnergy = 0;
    }

    // if (maximum_energy < this.lastNoteEnergy){
    //   return -1;
    // }
    // console.log(arg_max * freq_step, maximum_energy);

    this.last_note_time = time;
    this.lastNoteEnergy = maximum_energy;

    return arg_max * freq_step;
  }


  this.dispatchAudioData = function(time) {

    if (that.sendingAudioData) {
      requestAnimationFrame(that.dispatchAudioData);
    }

    let frequency = that.findNoteFreq(time);
    if (frequency < 0){
      return;
    }

    let freqs = string.freqs;

    let min_freq_error = 10000;
    let best_chord_ind = 0;
    for (let i = 0; i < freqs.length; i++){
      let chord_freq = freqs[i][0];
      let chord = freqs[i][1];

      //let n_div = frequency / chord_freq;   //for future
      let n_div = 1;
      let error = Math.abs( Math.round(n_div) * chord_freq - frequency);
      if (error < min_freq_error){
        best_chord_ind = i;
        min_freq_error = error;
      }
    }

    if (min_freq_error < 20){
      $(document).trigger("note_detected", freqs[best_chord_ind][1]);
    }

  }
}
