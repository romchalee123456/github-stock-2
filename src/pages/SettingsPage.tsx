import React from 'react';
    import { ChevronRight, Settings } from 'lucide-react';
    
    function SettingsPage() {
      return (
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <span>ตั้งค่า</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium">การตั้งค่าระบบ</span>
              </div>
            </div>
    
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <span>การตั้งค่าระบบ</span>
              </h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-700">ข้อมูลทั่วไป</h3>
                  <p className="text-gray-500">จัดการข้อมูลทั่วไปของระบบ</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-700">การแจ้งเตือน</h3>
                  <p className="text-gray-500">จัดการการแจ้งเตือนของระบบ</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-700">ความปลอดภัย</h3>
                  <p className="text-gray-500">จัดการการตั้งค่าความปลอดภัยของระบบ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    export default SettingsPage;

