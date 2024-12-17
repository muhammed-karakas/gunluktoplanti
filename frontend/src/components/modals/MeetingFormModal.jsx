import React, { useState } from 'react';
import { AutoComplete, Button, Col, ConfigProvider, DatePicker, Divider, Form, InputNumber, message, Modal, Row, Space, Typography } from 'antd';
import { useAutoComplete } from '../AutoCompleteManager';
import meetingService from '../../api/meetingService';
import tr from 'antd/lib/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { Text } = Typography;

const buildOptions = (arr) => {
    return [...new Set(arr)].map((item, idx) => ({
        value: item, label: item, key: item + idx
    }));
};

const handleAddToList = (value, list, setList, clearFn) => {
    if (value && !list.includes(value)) {
        setList([...list, value]);
        message.success('Başarıyla eklendi.');
        clearFn && clearFn('');
    } else {
        message.warning('Bu değer zaten mevcut veya geçersiz.');
    }
};

const handleEnterKey = (e, inputValue, selectedList, setSelectedList, setInputValue, fetchFn) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim()) {
            handleAddToList(inputValue, selectedList, setSelectedList, setInputValue);
            if (fetchFn && inputValue) fetchFn([...selectedList, inputValue]);
        }
    }
};

const AddableAutoComplete = ({ label, options, placeholder, selectedItems, setSelectedItems, inputValue, setInputValue, fetchFn, onFocusFn, }) => (
    <Form.Item label={label}>
        <Space.Compact style={{ width: '100%' }}>
            <AutoComplete
                options={options} placeholder={placeholder} allowClearvirtual={false} value={inputValue} onChange={setInputValue} onFocus={onFocusFn}
                onKeyDown={(e) => handleEnterKey(e, inputValue, selectedItems, setSelectedItems, setInputValue, fetchFn)}
                onSelect={(value) => {
                    handleAddToList(value, selectedItems, setSelectedItems, setInputValue);
                    if (fetchFn && value) fetchFn([...selectedItems, value]);
                }}
                filterOption={(inputValue, option) =>
                    option?.value.toLowerCase().includes(inputValue.toLowerCase())
                }
            />
            <Button
                type='primary'
                onClick={() => {
                    handleAddToList(inputValue, selectedItems, setSelectedItems, setInputValue);
                    if (fetchFn && inputValue) fetchFn([...selectedItems, inputValue]);
                }}
            >
                Ekle
            </Button>
        </Space.Compact>
        <Text>{selectedItems.join(', ') || `${label} seçilmedi.`}</Text>
    </Form.Item>
);

const MeetingFormModal = ({ visible, onClose, currentYear, currentMonth, refetchMeetings }) => {
    const [form] = Form.useForm();
    const {
        topics, locations, companies, approvalAuthorities, companyParticipants, departments,
        departmentParticipants, fetchCompanyParticipants, fetchDepartments, fetchDepartmentParticipants
    } = useAutoComplete();

    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [companyInputValue, setCompanyInputValue] = useState('');
    const [selectedCompanyParticipants, setSelectedCompanyParticipants] = useState([]);
    const [companyParticipantsInputValue, setCompanyParticipantsInputValue] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [departmentInputValue, setDepartmentInputValue] = useState('');
    const [selectedDepartmentParticipants, setSelectedDepartmentParticipants] = useState([]);
    const [departmentParticipantsInputValue, setDepartmentParticipantsInputValue] = useState('');
    const [selectedApprovalAuthorities, setSelectedApprovalAuthorities] = useState([]);
    const [approvalAuthorityInputValue, setApprovalAuthorityInputValue] = useState('');

    const resetAllStates = () => {
        setSelectedCompanies([]);
        setSelectedCompanyParticipants([]);
        setSelectedDepartments([]);
        setSelectedDepartmentParticipants([]);
        setSelectedApprovalAuthorities([]);
        setCompanyInputValue('');
        setCompanyParticipantsInputValue('');
        setDepartmentInputValue('');
        setDepartmentParticipantsInputValue('');
        setApprovalAuthorityInputValue('');
    };

    const onSubmit = async (values) => {
        if (
            selectedCompanies.length === 0 ||
            selectedCompanyParticipants.length === 0 ||
            selectedDepartments.length === 0 ||
            selectedDepartmentParticipants.length === 0 ||
            selectedApprovalAuthorities.length === 0
        ) {
            message.error('Lütfen en az bir şirket, şirket katılımcısı, departman, departman katılımcısı ve onay makamı ekleyin.');
            return;
        }

        const formattedValues = {
            ...values,
            companies: selectedCompanies,
            companyParticipants: selectedCompanyParticipants,
            departments: selectedDepartments,
            departmentParticipants: selectedDepartmentParticipants,
            approvalAuthorities: selectedApprovalAuthorities,
            meetingDatetime: dayjs(values.meetingDatetime).format('YYYY-MM-DDTHH:mm:ss'),
            approvalDatetime: dayjs(values.approvalDatetime).format('YYYY-MM-DDTHH:mm:ss'),
        };

        try {
            await meetingService.createMeeting(formattedValues);
            message.success('Toplantı başarıyla kaydedildi.');
            form.resetFields();
            const meetingDate = dayjs(values.meetingDatetime);
            if (meetingDate.year() === currentYear && meetingDate.month() === currentMonth) {
                refetchMeetings();
            }
            resetAllStates();
            onClose();
        } catch {
            message.error('Toplantı kaydedilirken bir hata oluştu.');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        resetAllStates();
        onClose();
    };

    const topicOptions = buildOptions(topics);
    const locationOptions = buildOptions(locations);
    const companyOptions = buildOptions(companies);
    const companyParticipantsOptions = buildOptions(companyParticipants);
    const departmentOptions = buildOptions(departments);
    const departmentParticipantsOptions = buildOptions(departmentParticipants);
    const approvalAuthoritiesOptions = buildOptions(approvalAuthorities);

    return (
        <ConfigProvider locale={tr}>
            <Modal
                title='Yeni Toplantı'
                centered
                width='75vw'
                open={visible}
                onCancel={handleCancel}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button type='primary' onClick={() => form.submit()} style={{ width: '30%', marginLeft: '10%' }}>
                            Kaydet
                        </Button>
                        <Button onClick={handleCancel} style={{ width: '20%' }}>
                            Kapat
                        </Button>
                    </div>
                }
                destroyOnClose
            >
                <Form form={form} layout='vertical' onFinish={onSubmit} preserve={false}>
                    <Row gutter={32}>
                        <Col span={12}>
                            <Divider>Genel Bilgiler</Divider>
                            <Form.Item name='topic' label='Konu' rules={[{ required: true, message: 'Konu boş bırakılamaz!' }]}>
                                <AutoComplete
                                    options={topicOptions}
                                    placeholder='Toplantı konusunu girin veya seçin'
                                    allowClear
                                    virtual={false}
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='location' label='Yer' rules={[{ required: true, message: 'Yer boş bırakılamaz!' }]}>
                                <AutoComplete
                                    options={locationOptions}
                                    placeholder='Toplantı yerini girin veya seçin'
                                    allowClear
                                    virtual={false}
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='meetingDatetime' label='Tarih ve Saat' rules={[{ required: true, message: 'Tarih ve saat boş bırakılamaz!' }]}>
                                <DatePicker
                                    showTime
                                    format='DD.MM.YYYY HH:mm'
                                    placeholder='Toplantı tarihini girin'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                name='duration'
                                label='Süre (dk)'
                                rules={[
                                    { required: true, message: 'Süre boş bırakılamaz!' },
                                    { type: 'number', min: 1, message: 'Süre en az 1 dakika olmalıdır!' }
                                ]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} placeholder='Toplantı süresini dakika cinsinden girin' />
                            </Form.Item>
                            <Divider>Şirketler ve Katılımcıları</Divider>
                            <AddableAutoComplete
                                label='Şirketler'
                                options={companyOptions}
                                placeholder='Şirketleri girin veya seçin'
                                selectedItems={selectedCompanies}
                                setSelectedItems={setSelectedCompanies}
                                inputValue={companyInputValue}
                                setInputValue={setCompanyInputValue}
                                fetchFn={fetchCompanyParticipants}
                            />
                            <AddableAutoComplete
                                label='Şirket Katılımcıları'
                                options={companyParticipantsOptions}
                                placeholder='Şirket katılımcılarını seçin veya girin'
                                selectedItems={selectedCompanyParticipants}
                                setSelectedItems={setSelectedCompanyParticipants}
                                inputValue={companyParticipantsInputValue}
                                setInputValue={setCompanyParticipantsInputValue}
                                onFocusFn={() => {
                                    if (selectedCompanies.length > 0) fetchCompanyParticipants(selectedCompanies);
                                }}
                            />
                        </Col>
                        <Col span={12}>
                            <Divider>Departmanlar ve Katılımcıları</Divider>
                            <AddableAutoComplete
                                label='Departmanlar'
                                options={departmentOptions}
                                placeholder='Departmanları seçin veya girin'
                                selectedItems={selectedDepartments}
                                setSelectedItems={setSelectedDepartments}
                                inputValue={departmentInputValue}
                                setInputValue={setDepartmentInputValue}
                                fetchFn={fetchDepartmentParticipants}
                                onFocusFn={() => {
                                    const locationValue = form.getFieldValue('location');
                                    if (locationValue) fetchDepartments([locationValue]);
                                }}
                            />
                            <AddableAutoComplete
                                label='Departman Katılımcıları'
                                options={departmentParticipantsOptions}
                                placeholder='Departman katılımcılarını seçin veya girin'
                                selectedItems={selectedDepartmentParticipants}
                                setSelectedItems={setSelectedDepartmentParticipants}
                                inputValue={departmentParticipantsInputValue}
                                setInputValue={setDepartmentParticipantsInputValue}
                                onFocusFn={() => {
                                    if (selectedDepartments.length > 0) fetchDepartmentParticipants(selectedDepartments);
                                }}
                            />
                            <Divider>Onay Bilgileri</Divider>
                            <AddableAutoComplete
                                label='Onay Makamları'
                                options={approvalAuthoritiesOptions}
                                placeholder='Onay makamlarını girin veya seçin'
                                selectedItems={selectedApprovalAuthorities}
                                setSelectedItems={setSelectedApprovalAuthorities}
                                inputValue={approvalAuthorityInputValue}
                                setInputValue={setApprovalAuthorityInputValue}
                            />
                            <Form.Item
                                name='approvalDatetime'
                                label='Onay Tarihi'
                                rules={[{ required: true, message: 'Onay tarihi boş bırakılamaz!' }]}
                            >
                                <DatePicker showTime format='DD.MM.YYYY HH:mm' placeholder='Onay tarihini girin' style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default MeetingFormModal;
