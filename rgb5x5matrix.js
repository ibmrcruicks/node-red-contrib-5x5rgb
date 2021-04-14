
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

const $WIDTH = 5;
const $HEIGHT = 5;

let wire;
let initialized
let I2C_BUS;
let I2C_ADDRESS;

class RGB5x5 {

constructor(device, i2cAddress) {
  if (typeof(device) == 'undefined') {
     device = 1;
  }
  initialized = false;
  I2C_BUS = parseInt(device);
  I2C_ADDRESS = parseInt(i2cAddress);
  wire = i2c.openSync(I2C_BUS);
} 

_SetGamma(color)
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
_Cheerlights(name)
{ 
  const $CHEERLIGHTS_TABLE = {
	"red":"0xFF0000",
	"green":"0x00FF00",
	"blue":"0x0000FF",
	"cyan":"0x00FFFF",
	"white":"0xFFFFFF",
	"warmwhite":"0xFDF5E6",
	"oldlace":"0xFDF5E6",
	"purple":"0x800080",
	"magenta":"0xFF00FF",
	"pink":"0xFF69B4",
	"yellow":"0xFFFF00",
	"amber":"0xFFD200",
	"orange":"0xFFA500",
	"black":"0x000000",
	"off":"0x000000"
	}
	if(typeof name === "string" && name.toLowerCase() in $CHEERLIGHTS_TABLE) {
		return($CHEERLIGHTS_TABLE[name.toLowerCase()])
	}
console.log("cheerlights name =", color);
	return("#BADDAD")
}
_GetPixelRedOffset(n)
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
_GetPixelGreenOffset(n)
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
_GetPixelBlueOffset(n)
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

_SetPixelRGB(x, y, color)
{
	var pixel = (parseInt(y) * $WIDTH) + parseInt(x);
	var address;
	const regexhex = /^0[Xx][A-Fa-f0-9]{6}$/;
	const regexrgb = /^#[A-Fa-f0-9]{6}$/;
	if ((typeof color === "string") && regexrgb.test(color)){
		color = parseInt("0x"+color.split('#')[1]);
	}
	if ((typeof color === "string") && !regexhex.test(color)){
		color = this._Cheerlights(color);
	}
  
	address = $COLOR_OFFSET + this._GetPixelRedOffset(pixel);
	wire.writeByteSync(I2C_ADDRESS, address, this._SetGamma((color & 0xff0000) >> 16));
	address = $COLOR_OFFSET + this._GetPixelGreenOffset(pixel);
	wire.writeByteSync(I2C_ADDRESS, address, this._SetGamma((color & 0x00ff00) >> 8));
	address = $COLOR_OFFSET + this._GetPixelBlueOffset(pixel);
	wire.writeByteSync(I2C_ADDRESS, address, this._SetGamma((color & 0x0000ff)));
}

SetPixelColor(x, y, color)
{
	if (parseInt(x) > $WIDTH || parseInt(y) > $HEIGHT) return;
	wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE); 
	this._SetPixelRGB(x, y, color);
//console.log(`Pixel ${x},${y} set to ${color}`);
}

DisplayOn()
{
	wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); 
	wire.writeByteSync(I2C_ADDRESS, $SHUTDOWN_REGISTER, 0b00000001); // Power On ("Normal Operation")
}
DisplayOff()
{
	wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); 
	wire.writeByteSync(I2C_ADDRESS, $SHUTDOWN_REGISTER, 0b00000000); // Power Off ("Shutdown Mode")
}
DisplayClear()
{
	wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE);
	for (var n = 0x24; n<=0xb3; n++) wire.writeByteSync(I2C_ADDRESS, n, 0x00); // Dim all LEDs first
	for (var n = 0x00; n<=0x11; n++) wire.writeByteSync(I2C_ADDRESS, n, 0xff); // Enable all LEDS 
}

Initialize()
{
//	if(this.initialized) return;
  
	this.DisplayOff();
  
	wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_CONFIG); // Point to Function (Control) Register
	wire.writeByteSync(I2C_ADDRESS, 0x00, 0b00000000); // Configuration Register -> Picture Mode
	wire.writeByteSync(I2C_ADDRESS, 0x01, 0b00000000); // Picture Display Register -> Display Frame 1
	wire.writeByteSync(I2C_ADDRESS, 0x02, 0b00000000); // Auto Play Control Register 1 -> Defaults/NA
	wire.writeByteSync(I2C_ADDRESS, 0x03, 0b00000000); // Auto Play Control Register 2 -> Defaults/NA
	wire.writeByteSync(I2C_ADDRESS, 0x05, 0b00000000); // Display Option Register -> Defaults
	wire.writeByteSync(I2C_ADDRESS, 0x06, 0b00000000); // Audio Synchronization Register -> Audio sync off
	wire.writeByteSync(I2C_ADDRESS, 0x08, 0b00000000); // Breath Control Register 1 -> Defaults
	wire.writeByteSync(I2C_ADDRESS, 0x09, 0b00000000); // Breath Control Register 2 -> Defaults
	wire.writeByteSync(I2C_ADDRESS, 0x0b, 0b00000000); // AGC Control Register -> Defaults/NA
	wire.writeByteSync(I2C_ADDRESS, 0x0c, 0b00000000); // Audio ADC Rate Register -> Defaults/NA
  
  	this.DisplayClear();
	this.DisplayOn();

	this.initialized = true;
	console.log("RGB5x5 matrix initialized");
}

ShowMatrix(input)
{
  var fill = true;

  if (Array.isArray(input) && (input.length == $WIDTH*$HEIGHT)) fill = false;

  wire.writeByteSync(I2C_ADDRESS, $FRAME_ADDRESS, $FRAME_PICTURE);
  for (var y=0; y<$HEIGHT; y++)
	{
		for (var x=0; x<$WIDTH; x++)
		{
			fill ? this._SetPixelRGB(x, y, input[0]) : this._SetPixelRGB(x, y, input[(y*$WIDTH) + x]);	
		}
	}
}

};

module.exports = RGB5x5;
