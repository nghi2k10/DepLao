import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Cloudinary config — thay giá trị của bạn vào đây
  const CLOUD_NAME = "dtsmm3z9b"; // 👉 ví dụ: "mychatapp123"
  const UPLOAD_PRESET = "chat_avatar_preset"; // 👉 ví dụ: "chatapp_upload"

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 1. Tạo tài khoản Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // 🔹 2. Upload avatar lên Cloudinary (nếu có)
      let photoURL =
        "https://res.cloudinary.com/dtsmm3z9b/image/upload/v1762159040/default_avatar_dvvkeg.png"; // avatar mặc định

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) photoURL = data.secure_url;
      }

      // 🔹 3. Cập nhật hồ sơ Firebase
      await updateProfile(user, { name, photoURL });

      // 🔹 4. Lưu người dùng vào Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        avatar: photoURL,
        createdAt: new Date(),
      });

      alert("Đăng ký thành công!");
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setError("Lỗi khi đăng ký: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Đăng ký tài khoản</h2>

        <input
          type="text"
          placeholder="Tên hiển thị"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm mb-1">Chọn ảnh đại diện (tùy chọn)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-center text-sm">
          Đã có tài khoản?{" "}
          <a href="/" className="text-blue-500 hover:underline">
            Đăng nhập
          </a>
        </p>
      </form>
    </div>
  );
}
