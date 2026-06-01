import { DeviceInfo, Material } from '@/types';

export const generatePLCProgram = (deviceInfo: DeviceInfo | null, materials: Material[]): string => {
  let program = `(* PLC控制程序 *)
(* 生成时间: ${new Date().toLocaleString()} *)

PROGRAM Main
VAR
  (* 输入变量 *)
  StartButton AT %I0.0 : BOOL;
  StopButton AT %I0.1 : BOOL;
  Sensor1 AT %I0.2 : BOOL;
  Sensor2 AT %I0.3 : BOOL;
  
  (* 输出变量 *)
  Motor AT %Q0.0 : BOOL;
  Cylinder AT %Q0.1 : BOOL;
  Alarm AT %Q0.2 : BOOL;
  
  (* 内部变量 *)
  Running : BOOL := FALSE;
  Timer : TON;
END_VAR

(* 主控制逻辑 *)
IF StartButton AND NOT StopButton THEN
  Running := TRUE;
ELSIF StopButton THEN
  Running := FALSE;
END_IF;

(* 电机控制 *)
IF Running AND Sensor1 THEN
  Motor := TRUE;
ELSE
  Motor := FALSE;
END_IF;

(* 气缸控制 *)
Timer(IN := Motor, PT := T#2S);
IF Timer.Q THEN
  Cylinder := TRUE;
ELSE
  Cylinder := FALSE;
END_IF;

(* 报警逻辑 *)
IF Running AND NOT Sensor1 AND NOT Sensor2 THEN
  Alarm := TRUE;
ELSE
  Alarm := FALSE;
END_IF;

END_PROGRAM
`;

  if (deviceInfo) {
    program = `(* 设备: ${deviceInfo.name} *)\n(* 类型: ${deviceInfo.type} *)\n` + program;
  }

  if (materials.length > 0) {
    program += `\n(* 物料清单: *)\n`;
    materials.forEach((mat, idx) => {
      program += `(* ${idx + 1}. ${mat.name} - ${mat.supplier} *)\n`;
    });
  }

  return program;
};

export const generateGCode = (deviceInfo: DeviceInfo | null): string => {
  let gcode = `; G代码程序
; 生成时间: ${new Date().toLocaleString()}
;
G21 ; 单位毫米
G90 ; 绝对坐标
G17 ; XY平面
`;

  gcode += `
; 初始化
G28 X0 Y0 Z0 ; 回原点
M03 S1000 ; 主轴启动
`;

  gcode += `
; 加工路径
G01 X10 Y10 F500
G01 X50 Y10
G01 X50 Y50
G01 X10 Y50
G01 X10 Y10
`;

  gcode += `
; 结束
M05 ; 主轴停止
G28 X0 Y0 Z0 ; 回原点
M30 ; 程序结束
`;

  return gcode;
};

export const exportProgram = (code: string, filename: string, language: string) => {
  let extension = 'txt';
  let mimeType = 'text/plain';
  
  if (language === 'ST') {
    extension = 'st';
    mimeType = 'text/plain';
  } else if (language === 'GCode') {
    extension = 'gcode';
    mimeType = 'text/plain';
  }
  
  const blob = new Blob([code], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
};
