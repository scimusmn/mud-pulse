#include "arduino.h"

boolean doPolling = false;

long timeNow = 0;
int count = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000; //5 second timer

class AppSketch {
public:

  static SerialMessenger messenger;

  AnalogInput analogInput1;
  Button button1;

  // Pin assignments
  int analogInput1Pin = A0;
  int button1Pin = 2;

  // Set to true, if you'd like to read the current value of the potentiometer in the main loop
  boolean readAnalogInputValue = true;

  AppSketch() {}

  void setup(SerialMessenger parentMessenger) {

    messenger = parentMessenger;

    if (readAnalogInputValue == true) {

      // Parameter 1: pin location
      // Parameter 2: enable averaging to get a less constant stream of data
      boolean enableAverager = true;
      // Parameter 3: enable lowpass filter for Averager to further smooth value
      boolean enableLowPass = true;
      // Parameter 4: callback

      analogInput1.setup(analogInput1Pin, enableAverager, enableLowPass, [](int analogInput1Value) {
        messenger.sendJsonMessage("pressure-reading", analogInput1Value);
      });
    }

    // By default, we're attaching a push button to pin 2
    button1.setup(button1Pin, [](int state) {
      if (state) {
        if (doPolling == false) {
          doPolling = true;
          timeNow = millis();
          messenger.sendJsonMessage("button-press", 1);
        }
      }
    });
  }

  void listenData() {
    // 5 second timer
    if (millis() < timeNow + timerDuration) {
      val = analogRead(0);
      delay(2);

      if ((val > 200) && (newread)) {
        newread = false;
        count = count + 1;
      }

      if (val < 190) {
        newread = true;
      }
    }
    else {
      doPolling = false;
      messenger.sendJsonMessage("time-up", 1);
    }
  }

  // Write pin states and send out confirmation and analog values over serial
  void writePins(String message, int intval) {
    if (message == "\"pressure-reading\"" && intval == 1) {
      messenger.sendJsonMessage("pressure-reading", analogInput1.readValue());
    }
    else {
      messenger.sendJsonMessage("unknown-command", 1);
    }
  }

  void idle() {
    if (readAnalogInputValue == true) {
      analogInput1.idle();
    }

    button1.idle();
    if (doPolling == true) {
      listenData();
    }
    else {
      // 2: Limestone
      // 3: Dolomite
      // 4: Shale
      // 5: Sandstone

      if (count > 1 && count < 5) {
          messenger.sendJsonMessage("material", count);
          count = 0;
      }
    }
  }
};
