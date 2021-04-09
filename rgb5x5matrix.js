
// https://www.issi.com/WW/pdf/31FL3731.pdf
// https://shop.pimoroni.com/products/5x5-rgb-matrix-breakout
// https://github.com/pimoroni/rgbmatrix5x5-python/blob/master/library/rgbmatrix5x5/is31fl3731.py

const i2c = require('i2c-bus'); 

const $MODE_REGISTER = 0x00
const $FRAME_REGISTER = 0x01
const $AUTOPLAY1_REGISTER = 0x02
const $AUTOPLAY2_REGISTER = 0x03
const $BLINK_REGISTER = 0x05
const $AUDIOSYNC_REGISTER = 0x06
const $BREATH1_REGISTER = 0x08
const $BREATH2_REGISTER = 0x09
const $SHUTDOWN_REGISTER = 0x0a
const $GAIN_REGISTER = 0x0b
const $ADC_REGISTER = 0x0c

const $FRAME_CONFIG = 0x0b
const $FRAME_ADDRESS = 0xfd
const $FRAME_PICTURE = 0x00

const $PICTURE_MODE = 0x00
const $AUTOPLAY_MODE = 0x08
const $AUDIOPLAY_MODE = 0x18

const $ENABLE_OFFSET = 0x00
const $BLINK_OFFSET = 0x12
const $COLOR_OFFSET = 0x24

module.exports = {
	init: Initialize,
	on: DisplayOn,
	off: DisplayOff,
	clear: DisplayClear,
	setPixel: SetPixelColor,
	showMatrix: ShowMatrix,
};

const $WIDTH = 5;
const $HEIGHT = 5;

var I2C_BUS = 0;
var I2C_ADDRESS = 0;

function SetGamma(color)
{ 
  const $DEFAULT_GAMMA_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,
    2,  2,  2,  3,  3,  3,  3,  3,  4,  4,  4,  4,  5,  5,  5,  5,
    6,  6,  6,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10, 10, 11, 11,
   11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18,
   19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 25, 25, 26, 27, 27, 28,
   29, 29, 30, 31, 31, 32, 33, 34, 34, 35, 36, 37, 37, 38, 39, 40,
   40, 41, 42, 43, 44, 45, 46, 46, 47, 48, 49, 50, 51, 52, 53, 54,
   55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
   71, 72, 73, 74, 76, 77, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89,
   90, 91, 93, 94, 95, 96, 98, 99,100,102,103,104,106,107,109,110,
  111,113,114,116,117,119,120,121,123,124,126,128,129,131,132,134,
  135,137,138,140,142,143,145,146,148,150,151,153,155,157,158,160,
  162,163,165,167,169,170,172,174,176,178,179,181,183,185,187,189,
  191,193,194,196,198,200,202,204,206,208,210,212,214,216,218,220,
  222,224,227,229,231,233,235,237,239,241,244,246,248,250,252,255
  ];
  return $DEFAULT_GAMMA_TABLE[color]; 
}
function GetPixelRedOffset(n)
{
	const $RED = [ 
    118, 117, 116, 115, 114, 
    132, 133, 134, 112, 113,
    131, 130, 129, 128, 127,
    125, 124, 123, 122, 121,
    126,  15,   8,   9,  10,
     11,  12,  13 
    ];
	return $RED[n];
}
function GetPixelGreenOffset(n)
{
	const $GREEN = [ 
    69,  68,  84,  83,  82,
    19,  20,  21,  80,  81,
    18,  17,  33,  32,  47,
    28,  27,  26,  25,  41,
    29,  95,  89,  90,  91,
    92,  76,  77
    ];
	return $GREEN[n];
}
function GetPixelBlueOffset(n)
{
	const $BLUE = [ 
     85, 101, 100,  99,  98,
     35,  36,  37,  96,  97,
     34,  50,  49,  48,  63,
     44,  43,  42,  58,  57,
     45, 111, 105, 106, 107,
    108, 109,  93
    ];
	return $BLUE[n];
}

function SetPixelRGB(x, y, color)
{
	var pixel = (y*$WIDTH) + x;
  var address;
  
	address = $COLOR_OFFSET + GetPixelRedOffset(pixel);
	I2C_BUS.writeByteSync(I2C_ADDRESS, address, SetGamma((color & 0xff0000) >> 16));
	address = $COLOR_OFFSET + GetPixelGreenOffset(pixel);
	I2C_BUS.writeByteSync(I2C_ADDRESS, address, SetGamma((color & 0x00ff00) >> 8));
	address = $COLOR_OFFSET + GetPixelBlueOffset(pixel);
	I2C_BUS.writeByteSync(I2C_ADDRESS, address, SetGamma((color & 0x0000ff)));
}

function SetPixelColor(x, y, color)
{
	if (x > $WIDTH || y > $HEIGHT) return;
	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE); 
	SetPixelRGB(x, y, color);
}

function Initialize(bus, address)
{
  I2C_BUS = bus;
	I2C_ADDRESS = address;
  
	DisplayOff();
  
	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); // Point to Function (Control) Register
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x00, 0b00000000); // Configuration Register -> Picture Mode
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x01, 0b00000000); // Picture Display Register -> Display Frame 1
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x02, 0b00000000); // Auto Play Control Register 1 -> Defaults/NA
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x03, 0b00000000); // Auto Play Control Register 2 -> Defaults/NA
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x05, 0b00000000); // Display Option Register -> Defaults
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x06, 0b00000000); // Audio Synchronization Register -> Defaults (audio synchronization disabled)
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x08, 0b00000000); // Breath Control Register 1 -> Defaults
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x09, 0b00000000); // Breath Control Register 2 -> Defaults
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x0b, 0b00000000); // AGC Control Register -> Defaults/NA
	I2C_BUS.writeByteSync(I2C_ADDRESS, 0x0c, 0b00000000); // Audio ADC Rate Register -> Defaults/NA
  
  DisplayClear();
	DisplayOn();
}

function DisplayOn()
{
	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); 
	I2C_BUS.writeByteSync(I2C_ADDRESS, $SHUTDOWN_REGISTER, 0b00000001); // Power On ("Normal Operation")
}
function DisplayOff()
{
	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); 
	I2C_BUS.writeByteSync(I2C_ADDRESS, $SHUTDOWN_REGISTER, 0b00000000); // Power Off ("Shutdown Mode")
}

function DisplayClear()
{
	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE);
	for (n = 0x24; n<=0xb3; n++) I2C_BUS.writeByteSync(I2C_ADDRESS, n, 0x00); // Dim all LEDs first
	for (n = 0x00; n<=0x11; n++) I2C_BUS.writeByteSync(I2C_ADDRESS, n, 0xff); // Enable all LEDS 
}

function ShowMatrix(input)
{
	var fill = true;

	if (Array.isArray(input) && (input.length == $WIDTH*$HEIGHT)) fill = false;

	I2C_BUS.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE);
  for (var y=0; y<$HEIGHT; y++)
	{
		for (var x=0; x<$WIDTH; x++)
		{
			fill ? SetPixelRGB(x, y, input[0]) : SetPixelRGB(x, y, input[(y*$WIDTH) + x]);	
		}
	}
}
