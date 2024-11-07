import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputLabel,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../constants/routes';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import { toPng } from 'html-to-image';

const LabelManagement = () => {
  const navigate = useNavigate();
  const [labelTitleText, setLabelTitleText] = useState('請掃描QR Code');
  const [labelText, setLabelText] = useState('@Fast');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const printRef = useRef();
  const [labelWidth, setLabelWidth] = useState(100);
  const [labelHeight, setLabelHeight] = useState(150);
  const [titleColor, setTitleColor] = useState('#FFFFFF');
  const [contentColor, setContentColor] = useState('#FFFFFF');
  const [footerColor, setFooterColor] = useState('rgba(59,155,58)');
  const [headerColor, setHeaderColor] = useState('#FFFFFF');

  // QR Code URL
  const qrCodeUrl = window.location.origin + ROUTES.HOME;

  // 處理標籤選擇
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: '錯誤',
        text: '請選擇標籤文件',
        icon: 'error',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        title: '錯誤',
        text: '標籤大小不能超過 5MB',
        icon: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  // 處理列印
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: ${labelWidth}mm ${labelHeight}mm;
        margin: 0;
      }
    `,
  });

  // 清除背景標籤
  const handleClearBackground = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // 修改匯出標籤功能
  const handleExportImage = async () => {
    const labelElement = printRef.current;
    if (!labelElement) {
      Swal.fire({
        title: '錯誤',
        text: '無法產生標籤',
        icon: 'error',
      });
      return;
    }

    try {
      // 顯示載入中提示
      Swal.fire({
        title: '請等待',
        text: '標籤製作中...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 暫時移除外部 margin，以確保只捕獲標籤內容
      const originalStyle = labelElement.style.margin;
      labelElement.style.margin = '0';

      // 計算實際像素尺寸（1mm ≈ 3.78px）
      const pixelWidth = Math.round(labelWidth * 3.78);
      const pixelHeight = Math.round(labelHeight * 3.78);

      const options = {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        width: pixelWidth,
        height: pixelHeight,
        backgroundColor: 'rgba(59,155,58)',
        canvasWidth: pixelWidth,
        canvasHeight: pixelHeight,
        style: {
          transform: 'none',
          width: `${pixelWidth}px`,
          height: `${pixelHeight}px`,
        },
        filter: (node) => {
          // 修改 filter 函數的邏輯
          if (node.tagName === 'BUTTON' || node.tagName === 'INPUT') {
            return false;
          }
          
          // 檢查是否有 classList 屬性再進行判斷
          if (node.classList && node.classList.contains('MuiBox-root')) {
            // 檢查是否為預覽區域的父容器
            if (node === printRef.current.parentElement) {
              return false;
            }
          }
          
          return true;
        },
      };

      // 等待所有資源載入
      await Promise.all([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 500))
      ]);

      // 產生標籤
      const dataUrl = await toPng(labelElement, options);

      // 恢復原始樣式
      labelElement.style.margin = originalStyle;

      // 創建臨時 canvas 來處理標籤
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 設置 canvas 尺寸
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        // 繪製標籤
        ctx.fillStyle = 'rgba(59,155,58)';
        ctx.fillRect(0, 0, pixelWidth, pixelHeight);
        ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);

        // 轉換為 PNG 並下載
        const finalDataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `標籤_${timestamp}.png`;
        link.href = finalDataUrl;
        link.click();

        // 關閉載入提示
        Swal.close();

        // 顯示成功訊息
     Swal.fire({
        title: '成功',
        text: '標籤已成功匯出',
            icon: 'success',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
      };

      img.onerror = () => {
        throw new Error('標籤產生失敗');
      };

      img.src = dataUrl;

    } catch (err) {
      console.error('標籤匯出錯誤:', err);
      Swal.fire({
        title: '錯誤',
        text: '標籤匯出失敗，請稍後再試',
        icon: 'error',
      });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        自訂標籤
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            type="number"
            label="標籤寬度 (mm)"
            value={labelWidth}
            onChange={(e) => setLabelWidth(Number(e.target.value))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ width: '150px' }}
          />
          <TextField
            type="number"
            label="標籤高度 (mm)"
            value={labelHeight}
            onChange={(e) => setLabelHeight(Number(e.target.value))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ width: '150px' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel>標題文字顏色</InputLabel>
            <input
              type="color"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              style={{ width: '50px', height: '50px', padding: 0, cursor: 'pointer' }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel>副標題文字顏色</InputLabel>
            <input
              type="color"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              style={{ width: '50px', height: '50px', padding: 0, cursor: 'pointer' }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel>內容文字顏色</InputLabel>
            <input
              type="color"
              value={contentColor}
              onChange={(e) => setContentColor(e.target.value)}
              style={{ width: '50px', height: '50px', padding: 0, cursor: 'pointer' }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel>頁尾文字顏色</InputLabel>
            <input
              type="color"
              value={footerColor}
              onChange={(e) => setFooterColor(e.target.value)}
              style={{ width: '50px', height: '50px', padding: 0, cursor: 'pointer' }}
            />
          </Box>
        </Box>

        <TextField
          fullWidth
          label="標題文字"
          value={labelTitleText}
          onChange={(e) => setLabelTitleText(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="內容文字"
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
          >
            選擇背景圖片
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageSelect}
            />
          </Button>
          {previewUrl && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearBackground}
            >
              清除背景圖片
            </Button>
          )}
        </Box>
      </Box>

      {/* 預覽區域陰影 */}
      <Box
        sx={{
          width: '100%',
          height: `${labelHeight * 1.2}mm`, // 給予額外空間以容納陰影
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          mb: 3, // 底部間距
        }}
      >
        {/* 預覽區域 */}
        <Paper 
          ref={printRef}
          style={{
            backgroundColor: 'rgba(59,155,58)',
            width: `${labelWidth}mm`,
            height: `${labelHeight}mm`,
          }}
          sx={{
            position: 'relative',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontSize: '50px', 
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          }}
        >
          <Typography
            sx={{
              fontSize: '50px', 
              fontWeight: 'bold',
              color: headerColor
            }}
          >
            線上點餐
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: '4px',
              maxWidth: '80%',
              wordBreak: 'break-word',
              fontSize: '35px', 
              fontWeight: 'bold',
              color: titleColor
            }}
          >
            {labelTitleText}
          </Typography>
          <QRCodeCanvas 
            value={qrCodeUrl}
            size={200}
            level="H"
            includeMargin={true}
            style={{ margin: '20px' }}
          />
          <Typography
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: '4px',
              maxWidth: '80%',
              wordBreak: 'break-word',
              fontSize: '24px', 
              fontWeight: 'bold',
              color: contentColor
            }}
          >
            {labelText}
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              width: '100%',
              wordBreak: 'break-word',
              fontSize: '24px', 
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: footerColor
            }}
          >
            提前預約 取餐更快速
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<PrintIcon />}
          onClick={handleExportImage}
          sx={{ minWidth: 200 }}
        >
          列印標籤
        </Button>
      </Box>
    </Box>
  );
};

export default LabelManagement; 