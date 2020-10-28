#!/bin/sh
ls

#Get name of file

echo "Name of file"
read name
#name = "Dirty_gold_01"

base_color="${name}_Color"
normal="${name}_Normal"
roughness="${name}_Roughness"
metallic="${name}_Metallic"
ao="${name}_AO"

base_color_png="${base_color}.png"
base_color_ktx="${base_color}.ktx"
./mipgen "${base_color}.png" "${base_color}.ktx"
./mipgen --compression=astc_fast_ldr_4x4 "${base_color}.png" "${base_color}_astc.ktx"
./mipgen --compression=s3tc_rgb_dxt1 "${base_color}.png" "${base_color}_s3tc.ktx"


./mipgen --strip-alpha --kernel=NORMALS --linear "${normal}.png" "${normal}.ktx"
./mipgen --strip-alpha --kernel=NORMALS --linear --compression=etc_rgb8_normalxyz_40 "${normal}.png" "${normal}_etc.ktx"

./mipgen --grayscale "${roughness}.png" "${roughness}.ktx"
./mipgen --grayscale --compression=etc_r11_numeric_40 "${roughness}.png" "${roughness}_etc.ktx"

./mipgen --grayscale "${metallic}.png" "${metallic}.ktx"
./mipgen --grayscale --compression=etc_r11_numeric_40 "${metallic}.png" "${metallic}_etc.ktx"

./mipgen --grayscale "${ao}.png" "${ao}.ktx"
./mipgen --grayscale --compression=etc_r11_numeric_40 "${ao}.png" "${ao}_etc.ktx"




