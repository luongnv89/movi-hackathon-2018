function text2speech( text, callbackOnEnd ){
   var msg = new SpeechSynthesisUtterance();
   var voices = window.speechSynthesis.getVoices();
   msg.voice = voices[10]; // Note: some voices don't support altering params
   msg.voiceURI = 'native';
   msg.volume = 1; // 0 to 1
   msg.rate = 1; // 0.1 to 10
   msg.pitch = 1.5; //0 to 2
   msg.text = text;
   msg.lang = 'en-US';
   msg.onend = callbackOnEnd;

   _print2Screen( text, "forestgreen")
   speechSynthesis.speak(msg);
}

var speech2textCallback = null;
function speech2text( callbackOnEnd ){
   speech2textCallback = callbackOnEnd;
}

function _print2Screen( text, color ){
   console.log( text );
   if( color == undefined )
      color = "blueviolet";
   
   $("#voice-text").html( text ).css("text-algin", color);
}

const recognition = new webkitSpeechRecognition();
//recognition.continuous = true;
//recognition.interimResults = true;
function _speech2text(){
   _print2Screen("");//clear old text
   recognition.onresult = function(event) { 
      
      var text = "";
      for(var i=0; i<event.results.length; i++){
         text += event.results[i][0].transcript;
      }
      _print2Screen( text );
      if( speech2textCallback && text != null )
         speech2textCallback( text );
      
      stopSiri();
   }
   recognition.start();
}

function stopSiri(){
   window.isStarting = true;
   $("#voice-icon").click();
}

$(function(){
   $("body").append('<div id="voice"><div id="voice-icon"></div><span id="voice-text"></span></div>');
   window.siriWave = new SiriWave9({
      container: document.getElementById('voice-icon'),
      width: 150,
      height: 50,
      speed: 0.2,
      amplitude: .1,
      autostart: true
   });
   
   siriWave.isStarting = false;
   $("#voice-icon").click( function(){
      siriWave.isStarting = !siriWave.isStarting;
      if( siriWave.isStarting ){
         siriWave.amplitude = 1;
         //siriWave.start();
         _speech2text();
      }else{
         siriWave.amplitude = .1;
         recognition.stop();
      }
   })
})