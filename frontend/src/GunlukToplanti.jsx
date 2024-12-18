import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Space, theme, Typography } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { AutoCompleteProvider } from './components/AutoCompleteManager';
import CalendarView from './components/CalendarView';
import FilterMeetingsModal from './components/modals/FilterMeetingsModal';
import MeetingFormModal from './components/modals/MeetingFormModal';
import dayjs from 'dayjs';

const GunlukToplanti = () => {
    const [headerFooterHeight, setHeaderFooterHeight] = useState(Math.max(window.innerHeight * 0.08, 32));
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState(dayjs().month());
    const [refetchMeetings, setRefetchMeetings] = useState(null);
    const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');
    const contentRef = useRef(null);

    const updateHeights = () => {
        setHeaderFooterHeight(Math.max(window.innerHeight * 0.08, 32));
    };

    useEffect(() => {
        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => {
            window.removeEventListener('resize', updateHeights);
        };
    }, []);

    useEffect(() => {
        document.body.style.background = themeMode === 'light' ? '#fbfbfb' : '#181818';
        document.body.style.transition = 'background 0.2s';
    }, [themeMode]);

    const toggleTheme = () => {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ConfigProvider theme={{ algorithm: themeMode === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm }}>
            <AutoCompleteProvider>
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div
                        style={{
                            backgroundColor: '#005',
                            color: 'white',
                            height: headerFooterHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 32px',
                        }}
                    >
                        <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
                            Günlük Toplantı Sistemi
                        </Typography.Title>
                        <Space style={{ gap: 16 }}>
                            <Button onClick={() => setIsMeetingModalVisible(true)}>Yeni Toplantı</Button>
                            <Button onClick={() => setIsFilterModalVisible(true)}>Toplantıları Filtrele</Button>
                            <Button icon={themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />} onClick={toggleTheme} />
                        </Space>
                    </div>
                    <div
                        ref={contentRef}
                        style={{
                            flexGrow: 1,
                            overflow: 'auto',
                            height: `calc(100vh - ${headerFooterHeight * 2}px)`,
                            padding: '16px',
                        }}
                    >
                        <CalendarView
                            onDateChange={(year, month) => {
                                setCurrentYear(year);
                                setCurrentMonth(month);
                            }}
                            onRefetchMeetings={(fn) => {
                                setRefetchMeetings(() => fn);
                            }}
                            themeMode={themeMode}
                        />
                    </div>
                    <div
                        style={{
                            backgroundColor: '#005',
                            color: 'white',
                            height: headerFooterHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Günlük Toplantı Sistemi ©2025
                    </div>
                    <MeetingFormModal
                        visible={isMeetingModalVisible}
                        onClose={() => setIsMeetingModalVisible(false)}
                        currentYear={currentYear}
                        currentMonth={currentMonth}
                        refetchMeetings={refetchMeetings}
                    />
                    <FilterMeetingsModal
                        visible={isFilterModalVisible}
                        onClose={() => setIsFilterModalVisible(false)}
                    />
                </div>
            </AutoCompleteProvider>
        </ConfigProvider>
    );
};

export default GunlukToplanti;
