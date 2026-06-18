const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

/** Đọc file ảnh thành data URL để gửi API */
export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Chưa chọn ảnh'))
      return
    }
    if (!ACCEPT_TYPES.includes(file.type)) {
      reject(new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Ảnh tối đa 2MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Không đọc được file ảnh'))
    reader.readAsDataURL(file)
  })
}
