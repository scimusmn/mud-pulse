//To be used with any 4D Systems Visi-Genie Gauges
//Reset operation is inverted, so that a 4D systems adaptor sheild is not needed.
//comnnect TX on display connector to TX on Arduino
//connect RX on display connenctor to RX on Arduino
//DO NOT power display using built-in 5V regulator on Arduino
//refer to Visi-Genie Gauge documentation for object names


#include "arduino-base/Libraries/AnalogInput.h"
#include "arduino-base/Libraries/Button.h"
#include "arduino-base/Libraries/Timer.h"
#include "arduino-base/Libraries/SerialManager.h"
#include <genieArduino.h>

#define analogInput1Pin A0
#define resetLine 4
#define button1Pin 2

SerialManager serialManager;
long baudRate = 115200;
AnalogInput analogInput1;
int traceValue;
Button button1;
Timer timer1;
Genie genie;

int currentAnalogInput1Value = 0;
int pulseCount = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000;
int peakValue = 0;
int threshold = 50;


void setup() {
  Serial.begin(9600);
  Serial1.begin(9600); //LCD display is on hardware serial "1"
  genie.Begin(Serial1);
  pinMode(resetLine, OUTPUT);  // Set D4 on Arduino to Output
  digitalWrite(resetLine, 0);  // Reset the Display via D4
  delay(100);
  digitalWrite(resetLine, 1);  // unReset the Display via D4
  delay(4000);

  // ANALOG INPUTS
  // We need to do averaging or we'll crash the app
  boolean enableAverager = true;
  // Sampling Rate shoud be high to throw out unecessary data, but low enough to not impact performance
  int samplingRate = 5;
  // We don't want use LowPass because that will make the graph not as responsive
  boolean enableLowPass = false;
  analogInput1.setup(analogInput1Pin, enableAverager, samplingRate, enableLowPass, [](int analogInputValue) {
    currentAnalogInput1Value = analogInputValue;
    traceValue = map(currentAnalogInput1Value, 0, 1023, 0, 100); //Map values for scope plot
    
  });

  //DIGITAL INPUTS
  button1.setup(button1Pin, [](int state) {
    if (!state) {
      if (timer1.isRunning() == false) {
        serialManager.sendJsonMessage("button-press", 1); //tell application to start listening to data
        pulseCount = 0;
        genie.WriteObject(GENIE_OBJ_FORM, 1, 1); // Get ready caption
        delay(1000);
        genie.WriteObject(GENIE_OBJ_FORM, 2, 1); // Get set...caption
        delay(1000);
        genie.WriteObject(GENIE_OBJ_FORM, 3, 1); // Go! caption
        delay(1000);
        for (int i = 0; i < 75; i++) { //clear previous data
          genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, 0); //write zeros width of scope display
        }
        genie.WriteObject(GENIE_OBJ_FORM, 0, 1); // show live scope
        timer1.start();
      }
    }
  });

  //TIMER
  timer1.setup([](boolean running, boolean ended, unsigned long timeElapsed) {
    if (running == true) {
      serialManager.sendJsonMessage("pressure-reading", currentAnalogInput1Value);
      if (currentAnalogInput1Value > 250 && newread == true) {
        newread = false;
        pulseCount++;
      }
      if (currentAnalogInput1Value < 200) {
        newread = true;
      }
    }
    else if (ended == true) {
      delay(1000);
      genie.WriteObject(GENIE_OBJ_FORM, 4, 1); //message sent to computer caption
      for (int i = 0; i < 75; i++) { //clear previous data
        genie.WriteObject(GENIE_OBJ_SCOPE, 0, 0); //write zeros width of scope display
      }
      delay(2000);
      genie.WriteObject(GENIE_OBJ_FORM, 0, 1); //show live scope
      serialManager.sendJsonMessage("time-up", 1);
      serialManager.sendJsonMessage("material", pulseCount);
    }
  }, timerDuration);
}

void loop() {
  analogInput1.idle();
  genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, traceValue); // Write the mapped values
  button1.idle();
  timer1.idle();
}


void onParse(char* message, int value) {
 if (strcmp(message, "pressure-reading") == 0 && value == 1) {
    serialManager.sendJsonMessage(message, analogInput1.readValue());
 }
  if (strcmp(message, "wake-arduino") == 0 && value == 1) {
    serialManager.sendJsonMessage("arduino-ready", 1);
  }
  else {
    serialManager.sendJsonMessage("unknown-command", 1);
  }
}
