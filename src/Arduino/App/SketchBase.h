#include "arduino.h"

class AppSketch {
public:
  
  static SerialMessenger messenger;

  AnalogInput analogInput1;
  Button button1;

  // Pin assignments
  int analogInputPin1 = A0;
  int buttonPin = 2;
  int ledPin = 3;
  int pwmOutputPin = 5;

  AppSketch() {}

  void setup(SerialMessenger parentMessenger) {

    messenger = parentMessenger;

    // For every sketch, we need to set up our IO
    // Setup digital pins and default modes as needed, analog inputs are setup by default
    pinMode(ledPin, OUTPUT);
    pinMode(pwmOutputPin, OUTPUT);

    // ANALOG INPUTS

    // Parameter 1: pin location
    // Parameter 2: enable averaging to get a less constant stream of data
    boolean enableAverager = true;
    // Parameter 3: enable lowpass filter for Averager to further smooth value
    boolean enableLowPass = true;
    // Parameter 4: callback

    analogInput1.setup(analogInputPin1, enableAverager, enableLowPass, [](int analogInputValue) {
      messenger.sendJsonMessage("analog-input1", analogInputValue);
    });

    // DIGITAL INPUTS

    // Parameter 1: pin location
    // Parameter 2: callback

    button1.setup(buttonPin, [](int state) {
      if (state) messenger.sendJsonMessage("button1-press", 1);
    });
  }

  // Write pin states and send out confirmation and analog values over serial
  void writePins(String message, int intval) {
    if (message == "\"led\"" && intval == 1) {
      // Turn-on led
      digitalWrite(ledPin, intval);
    }
    else if (message == "\"led\"" && intval == 0) {
      // Turn-off led
      digitalWrite(ledPin, intval);
    }
    else if (message == "\"pwm-output\"" && intval >= 0) {
      // Set pwm value to pwm pin
      analogWrite(pwmOutputPin, intval);
      messenger.sendJsonMessage("pwm-set", intval);
    }
    else if (message == "\"pot-rotation\"" && intval == 1) {
      messenger.sendJsonMessage("pot-rotation", analogInput1.readValue());
    }
    else {
      messenger.sendJsonMessage("unknown-command", 1);
    }
  }

  void idle() {
    analogInput1.idle();
    button1.idle();
  }
};
