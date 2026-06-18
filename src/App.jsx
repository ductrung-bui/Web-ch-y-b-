import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import './app-shell.css'

import { RequireAuth, RedirectRoot } from './components/routingGuards.jsx'

import DangnhapView from './pages/views/dangnhap.jsx'
import DangkyView from './pages/views/dangky.jsx'
import NhapemailkhoiphucView from './pages/views/nhapemailkhoiphuc.jsx'
import KhoiphucmatkhauView from './pages/views/khoiphucmatkhau.jsx'
import ThaydoimatkhauView from './pages/views/thaydoimatkhau.jsx'

import MnhnhtrangchView from './pages/views/mnhnhtrangch.jsx'
import IndexView from './pages/views/index.jsx'
import KinhnghimView from './pages/views/kinhnghim.jsx'
import LchtrongthngView from './pages/views/lchtrongthng.jsx'
import LichsuchuyendiView from './pages/views/lichsuchuyendi.jsx'
import ThongtinvedadatView from './pages/views/thongtinvedadat.jsx'
import ThongtinvedahuyView from './pages/views/thongtinvedahuy.jsx'
import TripDetailRoute from './pages/views/TripDetailRoute.jsx'

import ManhinhchonthoigianchuyendiView from './pages/views/manhinhchonthoigianchuyendi.jsx'
import ManhinhchonvitrighengoiView from './pages/views/manhinhchonvitrighengoi.jsx'
import DichvubosungView from './pages/views/dichvubosung.jsx'
import ManhinhdienthongtinView from './pages/views/manhinhdienthongtin.jsx'
import ManhinhthanhtoanView from './pages/views/manhinhthanhtoan.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RedirectRoot />} />

          <Route path="/dang-nhap" element={<DangnhapView />} />
          <Route path="/dang-ky" element={<DangkyView />} />
          <Route path="/nhap-email-khoi-phuc" element={<NhapemailkhoiphucView />} />
          <Route path="/khoi-phuc-mat-khau" element={<KhoiphucmatkhauView />} />
          <Route
            path="/thay-doi-mat-khau"
            element={
              <RequireAuth>
                <ThaydoimatkhauView />
              </RequireAuth>
            }
          />

          <Route path="/trang-chu" element={<MnhnhtrangchView />} />
          <Route path="/gioi-thieu" element={<IndexView />} />
          <Route path="/kinh-nghiem" element={<KinhnghimView />} />
          <Route path="/lich-trong-thang" element={<LchtrongthngView />} />
          <Route
            path="/lich-su-chuyen-di"
            element={
              <RequireAuth>
                <LichsuchuyendiView />
              </RequireAuth>
            }
          />
          <Route
            path="/ve-cua-toi"
            element={
              <RequireAuth>
                <ThongtinvedadatView />
              </RequireAuth>
            }
          />
          <Route
            path="/ve-da-huy"
            element={
              <RequireAuth>
                <ThongtinvedahuyView />
              </RequireAuth>
            }
          />
          <Route path="/chi-tiet-chuyen-di" element={<Navigate to="/trang-chu" replace />} />

          <Route path="/chuyen-di/:id" element={<TripDetailRoute />} />

          <Route
            path="/chon-thoi-gian-chuyen-di"
            element={
              <RequireAuth>
                <ManhinhchonthoigianchuyendiView />
              </RequireAuth>
            }
          />
          <Route
            path="/chon-vi-tri-ghe"
            element={
              <RequireAuth>
                <ManhinhchonvitrighengoiView />
              </RequireAuth>
            }
          />
          <Route
            path="/dich-vu-bo-sung"
            element={
              <RequireAuth>
                <DichvubosungView />
              </RequireAuth>
            }
          />
          <Route
            path="/dien-thong-tin"
            element={
              <RequireAuth>
                <ManhinhdienthongtinView />
              </RequireAuth>
            }
          />
          <Route
            path="/thanh-toan"
            element={
              <RequireAuth>
                <ManhinhthanhtoanView />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
