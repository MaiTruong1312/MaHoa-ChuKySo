# Kịch bản thuyết trình E2E Encryption Demo

## Slide 1: Giới thiệu về E2E Encryption
- **Nội dung:** Khái niệm mã hóa đầu cuối (End-to-End Encryption).
- **Script:** Xin chào mọi người, hôm nay nhóm sẽ trình bày về E2E Encryption - cơ chế bảo mật quan trọng nhất trong các ứng dụng nhắn tin hiện nay. Điểm cốt lõi của E2E là: chỉ có người gửi và người nhận mới có thể đọc được tin nhắn, máy chủ trung gian không thể đọc hay thay đổi dữ liệu.

## Slide 2: Kiến trúc hệ thống (AES + RSA)
- **Nội dung:** Sơ đồ kết hợp mã hóa đối xứng (AES) và bất đối xứng (RSA).
- **Script:** Để đảm bảo cả tính bảo mật và hiệu năng, hệ thống sử dụng AES để mã hóa nội dung tin nhắn vì tốc độ phân tải và xử lý rất nhanh. Tuy nhiên, để trao đổi khóa AES an toàn, chúng ta dùng RSA - mã hóa bất đối xứng. Đồng thời, hàm băm SHA-256 tính toán chữ ký điện tử liên tục để chống giả mạo.

## Slide 3: Demo Simple Mode (3 phút)
- **Nội dung:** Giao diện cơ bản cho người dùng cuối.
- **Script:** Bây giờ chúng ta sẽ xem ứng dụng thực tế. Đây là giao diện Simple Mode. Khi Alice gửi "Xin chào", ở giữa - trên đường truyền - dữ liệu hoàn toàn là các ký tự mã hóa lộn xộn. Bob nhận được sẽ tự động giải mã và hiển thị "Xin chào" cùng icon màu xanh xác nhận an toàn. Quá trình này diễn ra mượt mà và ẩn giấu các phức tạp.

## Slide 4: Demo Advanced Mode (3 phút)
- **Nội dung:** Phân tích chi tiết 9 bước mã hóa.
- **Script:** Để rõ hơn điều gì xảy ra ở "bên dưới", ta chuyển sang Advanced Mode với 9 bước:
    1. Đầu tiên, tin nhắn gốc tạo ra Hash.
    2. Một key AES ngẫu nhiên sinh ra và mã hóa tin nhắn đó.
    3. Key AES này lại bị mã hóa bởi Public Key của Bob ngay lập tức.
    4. Cùng lúc, Hash của tin nhắn được ký bởi Private Key của Alice.
    Chỉ khi các bước giải mã ngược lại thành công, Bob mới đọc được thông điệp mà không bị báo lỗi.

## Slide 5: Tamper Detection Demo (1 phút)
- **Nội dung:** Tính năng phát hiện giả mạo.
- **Script:** Chuyện gì xảy ra nếu hacker thay đổi dữ liệu trên đường truyền? Khi ấn nút "Giả mạo" (Tamper), hệ thống cố ý làm méo 1 ký tự của Cipher Text. Lúc này, hàm giải mã AES sinh ra dữ liệu sai, dẫn tới chuỗi Hash bị thay đổi, chữ ký điện tử bị từ chối kiểm duyệt và trả về Fail! Hệ thống tức khắc cảnh báo chữ màu đỏ, bảo vệ an toàn cho thiết bị.

## Slide 6: So sánh với WhatsApp/Messenger
- **Nội dung:** Liên hệ thực tế trên thế giới.
- **Script:** Kiến trúc chúng ta vừa xem chính là phiên bản thu gọn của các Protocol bảo mật như Signal Protocol mà WhatsApp, Zalo (chế độ ẩn bí mật), hay tính năng Secret Conversation của Messenger đang sử dụng. 

## Slide 7: Kết luận và ứng dụng thực tế
- **Nội dung:** Tổng kết nội dung thuyết trình.
- **Script:** Tổng kết lại, mô hình mã hóa E2E Hybrid (kết hợp RSA + AES + Hash Signing) đảm bảo được 3 yếu tố thiêng liêng về tính riêng tư: Tính bảo mật, tính toàn vẹn (không thể can thiệp), và tính xác thực (đúng người gửi đích thực).

## Slide 8: Q&A
- **Nội dung:** Trả lời các thắc mắc (các câu hỏi thường gặp).
- **FAQ 1:** *Tại sao không dùng luôn RSA mã hóa trực tiếp tin nhắn?* -> Vì RSA xử lý chậm trên khối lượng lớn dữ liệu, chỉ hợp với payload nhỏ như AES key. Dùng AES cho tin nhắn sẽ tối ưu hóa tốc độ hệ thống hơn.
- **FAQ 2:** *Làm sao biết Public Key của Bob là thật mà không bị tráo?* -> Trong môi trường thực tế cần có hạ tầng khóa công khai (PKI) hay Certificate Authority. Còn ở demo này đơn giản hóa trao đổi sẵn trong bộ nhớ hệ thống.
