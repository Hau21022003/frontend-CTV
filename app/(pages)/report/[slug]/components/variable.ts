export const fieldConfigurations = {
  // id: { label: "id", type: "number" },
  isCompleted: { label: "id", type: "boolean" },
  totalLaborers: { label: "Tổng số lao động", type: "number" },
  safetyHygieneWorkers: { label: "Người làm công tác ATVSLĐ", type: "number"},
  healthWorkers: { label: "Người làm công tác y tế", type: "number" },
  femaleWorkers: { label: "Lao động nữ", type: "number" },
  heavyDangerousWorkers: {
    label: "Lao động làm việc trong điều kiện độc hại",
    type: "number",
  },
  minorWorkers: {
    label: "Lao động là người chưa thành niên",
    type: "number",
  },
  workersUnder15: { label: "Lao động dưới 15 tuổi", type: "number" },
  disabledWorkers: { label: "Lao động người khuyết tật", type: "number" },
  elderlyWorkers: { label: "Lao động người cao tuổi", type: "number" },

  totalAccidents: { label: "Tổng số vụ TNLĐ", type: "number" },
  fatalAccidents: { label: "Số vụ có người chết", type: "number" },
  totalLaborAccidents: { label: "Số người bị TNLĐ", type: "number" },
  laborDeaths: { label: "Số người chết vì TNLĐ", type: "number" },
  totalAccidentCost: { label: "Tổng chi phí cho TNLĐ", type: "number" },
  daysOff: { label: "Số ngày công vì TNLĐ", type: "number" },

  totalCumulativeCases: {
    label: "Tổng số người bị BNN tới thời điểm BC",
    type: "number",
  },
  earlyRetirementsDueToDisease: {
    label: "Số người nghỉ trước tuổi hưu vì BNN",
    type: "number",
  },
  newCases: { label: "Số người mắc mới BNN", type: "number" },
  totalDiseaseCost: { label: "Tổng chi phí BNN phát sinh trong năm", type: "money" },
  daysOffDueToDisease: { label: "Số ngày công nghỉ phép vì BNN", type: "number" },

  typeI: { label: "Loại I (Người)", type: "number" },
  typeII: { label: "Loại II (Người)", type: "number" },
  typeIII: { label: "Loại III (Người)", type: "number" },
  typeIV: { label: "Loại IV (Người)", type: "number" },
  typeV: { label: "Loại V (Người)", type: "number" },

  totalTypeITrained: {
    label: "Nhóm 1: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  selfTraining: {
    label: "Trong đó: Tự huấn luyện",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTypeIITrained: {
    label: "Nhóm 2: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  hiredTraining: {
    label: "Trong đó: Thuê tổ chức cung cấp dịch vụ huấn luyện",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTypeIIITrained: {
    label: "Nhóm 3: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTypeIVTrained: {
    label: "Nhóm 4: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTypeVTrained: {
    label: "Nhóm 5: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTypeVITrained: {
    label: "Nhóm 6: SL huấn luyện/SL hiện có (Người/Người)",
    type: "slash",
    prefix: "0",
    suffix: "0",
  },
  totalTrainingCost: { label: "Tổng chi phí huấn luyện", type: "money" },

  totalMachines: { label: "Tổng số", type: "number" },
  uninspectedMachines: { label: "Số chưa được kiểm định", type: "number" },
  machinesInUse: {
    label: "Máy có yêu cầu nghiêm ngặt về ATVSLĐ đang sử dụng",
    type: "number",
  },
  inspectedMachines: { label: "Số đã được kiểm định", type: "number" },
  undeclaredMachines: { label: "Số chưa được khai báo", type: "number" },
  declaredMachines: { label: "Số đã được khai báo", type: "number" },

  partTimeLaborers: {
    label: "Tổng số người làm thêm trong năm (người)",
    type: "number",
  },
  totalOvertimeHours: {
    label: "Tổng số giờ làm thêm trong năm (người)",
    type: "number",
  },
  highestWorkingHours: {
    label: "Số giờ làm thêm cao nhất trong 1 tháng (người)",
    type: "number",
  },

  totalLaborersHazard: { label: "Tổng số người", type: "number" },
  totalCost: {
    label: "Tổng chi phí quy định tại điểm 10",
    type: "money",
  },

  totalSamples: {
    label: "Số mẫu quan trắc môi trường lao động (Mẫu)",
    type: "number",
  },
  nonStandardSamples: {
    label: "Số mẫu không đạt tiêu chuẩn (Mẫu)",
    type: "number",
  },
  temperatureSamples: {
    label: "Mẫu nhiệt độ không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  lightSamples: {
    label: "Mẫu ánh sáng không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  vibrationSamples: {
    label: "Mẫu rung không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  electromagneticSamples: {
    label: "Mẫu điện từ trường không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  humiditySamples: {
    label: "Mẫu độ ẩm không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  noiseSamples: {
    label: "Mẫu tiếng ồn không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  toxicGasSamples: {
    label: "Mẫu hơi khí độc không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  otherSamples: {
    label: "Mẫu khác không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  windSpeedSamples: {
    label: "Mẫu tốc độ gió không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  dustSamples: {
    label: "Mẫu bụi không đạt (Mẫu/Mẫu)",
    type: "slash",
  },
  radiationSamples: {
    label: "Mẫu phóng xạ không đạt (Mẫu/Mẫu)",
    type: "slash",
  },

  technicalSafetyMeasures: {
    label: "Các biện pháp kỹ thuật an toàn",
    type: "money",
  },
  technicalHygieneMeasures: {
    label: "Các biện pháp kỹ thuật vệ sinh",
    type: "money",
  },
  personalProtectiveEquipment: { label: "Trang bị phương tiện bảo vệ cá nhân", type: "money" },
  trainingAndAwareness: { label: "Tuyên truyền huấn luyện", type: "money" },
  workerHealthCare: {
    label: "Chăm sóc sức khỏe người lao động",
    type: "money",
  },
  riskAssessmentSafetyHygiene: {
    label: "Đánh giá nguy cơ rủi ro về ATVSLĐ",
    type: "money",
  },
  otherCosts: { label: "Chi khác", type: "money" },

  safetyHygieneServiceProvider: {
    label: "Tên tổ chức dịch vụ ATVSLĐ được thuê",
    type: "number",
  },
  healthServiceProvider: {
    label: "Tên tổ chức dịch vụ vệ sinh được thuê",
    type: "number",
  },
  riskAssessmentDate: { label: "Tháng/Năm", type: "date" },
};
