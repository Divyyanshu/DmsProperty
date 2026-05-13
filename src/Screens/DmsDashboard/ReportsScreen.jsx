import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  FlatList,
  Modal,
} from 'react-native';

// ─── Colors ───────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark:        '#0F172A',
  primary:        '#F59E0B',
  text_white:     '#F1F5F9',
  text_grey:      '#94A3B8',
  text_dark:      '#1E293B',
  text_label:     '#64748B',
  inputBorder:    '#E2E8F0',
  inputBg:        '#F1F5F9',
  card_bg:        '#FFFFFF',
  green_bg:       'rgba(34,197,94,0.15)',
  green_text:     '#16A34A',
  blue_text:      '#3B82F6',
  gold_bg:        'rgba(245,158,11,0.15)',
  page_bg:        '#EEF0F6',
  red_bg:         'rgba(239,68,68,0.15)',
  red_text:       '#EF4444',
  overlay_circle: 'rgba(245,158,11,0.10)',
};

// ─── Font Sizes ───────────────────────────────────────────────────────────────

const F = {
  f8:  8,
  f10: 10,
  f11: 11,
  f12: 12,
  f13: 13,
  f14: 14,
  f15: 15,
  f16: 16,
  f18: 18,
  f20: 20,
  f22: 22,
};

// ─── Card Shadow ──────────────────────────────────────────────────────────────

const cardShadow = Platform.select({
  ios: {
    shadowColor:   '#B0B8C8',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius:  8,
  },
  android: {
    elevation: 3,
  },
});

// ─── Dropdown Options ─────────────────────────────────────────────────────────

const CATEGORY_OPTIONS   = ['All', 'Gym', 'Farmhouse', 'Airbnb'];
const PROPERTY_OPTIONS   = ['All', 'Rajapark', 'Summer Nagar', 'Grey Stone', 'SkyStone', 'Topaz'];
const ENQ_STATUS_OPTIONS = ['All', 'Converted', 'Pending', 'Closed'];
const SUB_STATUS_OPTIONS = ['All', 'Active', 'Expired', 'Expiring Soon'];
const DURATION_OPTIONS   = ['All', '1 Month', '3 Months', '6 Months', '1 Year'];
const PAYMENT_OPTIONS    = ['All', 'Cash', 'UPI', 'Card'];
const PERIOD_OPTIONS     = ['This Month', 'Last Month', 'Last 3 Months', 'This Year'];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ENQUIRY_STATS = [
  { key: 'total',     label: 'TOTAL',     value: '36',  sub: '↑ 8%', subColor: Colors.green_text },
  { key: 'converted', label: 'CONVERTED', value: '22',  sub: '61%',  subColor: Colors.blue_text  },
  { key: 'pending',   label: 'PENDING',   value: '14',  sub: '39%',  subColor: Colors.primary    },
];

const SUBSCRIPTION_STATS = [
  { key: 'active',   label: 'ACTIVE',   value: '184',   sub: '↑ 12%', subColor: Colors.green_text },
  { key: 'revenue',  label: 'REVENUE',  value: '₹1.8L', sub: '↑ 21%', subColor: Colors.green_text },
  { key: 'expiring', label: 'EXPIRING', value: '14',    sub: 'Soon',  subColor: Colors.primary    },
];

const ENQUIRY_STATUS_STYLE = {
  Converted: { bg: Colors.green_bg, text: Colors.green_text },
  Pending:   { bg: Colors.gold_bg,  text: Colors.primary    },
  Closed:    { bg: Colors.red_bg,   text: Colors.red_text   },
};

const SUB_STATUS_STYLE = {
  Active:   { bg: Colors.green_bg, text: Colors.green_text },
  Expiring: { bg: Colors.gold_bg,  text: Colors.primary    },
  Expired:  { bg: Colors.red_bg,   text: Colors.red_text   },
};

// ─── Full Enquiry Data ────────────────────────────────────────────────────────

const ENQUIRY_DATA = [
  {
    id: 1, name: 'Yoshita', property: 'Rajapark', date: '28 Apr', status: 'Converted',
    mobile: '91234 56789', email: 'ravi.sharma@gmail.com', dob: '12 Jan 1990',
    category: 'Gym', enquiryDate: '28 Apr 2026', services: 'Personal Training',
    duration: '1 Month', expectedJoining: '01 May 2026', source: 'Instagram',
    remarks: 'Prefers morning slots',
  },
  {
    id: 2, name: 'Priya Singh', property: 'Topaz (2BHK)', date: '27 Apr', status: 'Pending',
    mobile: '91234 56789', email: 'priya.singh@yahoo.com', dob: '05 Jul 1995',
    category: 'Airbnb', enquiryDate: '27 Apr 2026', services: null,
    duration: '2 Nights', expectedJoining: '03 May 2026', source: 'Instagram',
    remarks: 'Needs early check-in',
  },
  {
    id: 3, name: 'Amit Gupta', property: 'Grey Stone', date: '26 Apr', status: 'Converted',
    mobile: '98765 43210', email: 'amit.gupta@gmail.com', dob: '22 Mar 1988',
    category: 'Farmhouse', enquiryDate: '26 Apr 2026', services: 'Catering',
    duration: '1 Day', expectedJoining: '05 May 2026', source: 'Google',
    remarks: 'Weekend booking preferred',
  },
  {
    id: 4, name: 'Neha Joshi', property: 'Summer Nagar', date: '25 Apr', status: 'Pending',
    mobile: '97654 32109', email: 'neha.joshi@hotmail.com', dob: '14 Sep 1992',
    category: 'Gym', enquiryDate: '25 Apr 2026', services: 'Yoga, Zumba',
    duration: '3 Months', expectedJoining: '10 May 2026', source: 'Facebook',
    remarks: 'Looking for group classes',
  },
  {
    id: 5, name: 'Vikram Patel', property: 'Ruby', date: '24 Apr', status: 'Converted',
    mobile: '96543 21098', email: 'vikram.patel@gmail.com', dob: '03 Nov 1985',
    category: 'Airbnb', enquiryDate: '24 Apr 2026', services: null,
    duration: '3 Nights', expectedJoining: '01 May 2026', source: 'Referral',
    remarks: 'Needs parking space',
  },
  {
    id: 6, name: 'Sunita Rao', property: 'SkyStone', date: '23 Apr', status: 'Closed',
    mobile: '95432 10987', email: 'sunita.rao@yahoo.com', dob: '18 Feb 1991',
    category: 'Farmhouse', enquiryDate: '23 Apr 2026', services: 'Swimming Pool',
    duration: '1 Day', expectedJoining: null, source: 'Walk-in',
    remarks: 'Budget constraints',
  },
  {
    id: 7, name: 'Deepak Mehta', property: 'Sapphire', date: '22 Apr', status: 'Converted',
    mobile: '94321 09876', email: 'deepak.mehta@gmail.com', dob: '29 Jun 1987',
    category: 'Gym', enquiryDate: '22 Apr 2026', services: 'CrossFit',
    duration: '6 Months', expectedJoining: '15 May 2026', source: 'Instagram',
    remarks: 'Needs locker facility',
  },
  {
    id: 8, name: 'Anjali Verma', property: 'Rajapark', date: '21 Apr', status: 'Pending',
    mobile: '93210 98765', email: 'anjali.verma@gmail.com', dob: '07 Dec 1994',
    category: 'Gym', enquiryDate: '21 Apr 2026', services: 'Aerobics',
    duration: '1 Month', expectedJoining: '20 May 2026', source: 'Google',
    remarks: 'Wants trial session first',
  },
];

const SUBSCRIPTION_DATA = [
  { 
  id: 1, member: 'Ravi Sharma', property: 'Rajapark', plan: '3M', 
  planLabel: '3 Months',        // plan ka full label
  amount: '₹3,500', status: 'Active',
  mobile: '98765 43210',        // naya
  category: 'Gym',              // naya
  startDate: '01 Feb 2026',     // naya
  endDate: '30 Apr 2026',       // naya
  paymentMode: 'UPI',           // naya
  remarks: 'Auto-renewal enabled', // naya
},
  { id: 2, member: 'Priya Singh',  property: 'Topaz',       plan:'1D', planLabel: '1 Day',  amount: '₹8,000',  status: 'Expiring', mobile:'91234455544', category:'Airbnb',     startDate:'01 Feb 2026',     endDate:'02 Feb 2026', paymentMode:'UPI', remarks:'Auto-renewal enabled'},
  { id: 3, member: 'Amit Gupta',   property: 'Grey Stone',  plan:'2D', planLabel: '2 Days',  amount: '₹45,000', status: 'Active' , mobile:'95985485498', category:'Farmhouse',  startDate:'06 March 2026',   endDate:'08 March 2026', paymentMode:'UPI', remarks:'Auto-renewal enabled'  },
  { id: 4, member: 'Neha Joshi',   property: 'Rajapark',    plan:'3M',planLabel: '3 Months',amount: '₹9,000',  status: 'Active',  mobile:'39347393393', category:'Gym',        startDate:'01 July 2026',    endDate:'01 October 2026', paymentMode:'UPI', remarks:'Auto-renewal enabled' },
  { id: 5, member: 'Vikram Patel', property: 'Ruby',        plan:'3M',planLabel: '2 Days',  amount: '₹6,500',  status: 'Expired', mobile:'37383933939', category:'Airbnb',     startDate:'10 August 2026',  endDate:'03 August 2026',paymentMode:'UPI',remarks:'Auto-renewal enabled' },
  { id: 6, member: 'Sunita Rao',   property: 'Summer Nagar',plan:'1M',planLabel: '1 Months', amount: '₹4,200',  status: 'Active', mobile:'28484449494', category:'Gym',        startDate:'01 September 2026',endDate:'01 October 2026',paymentMode:'UPI',remarks:'Auto-renewal enabled' },
  { id: 7, member: 'Deepak Mehta', property: 'Sapphire',    plan:'3D',planLabel: '3 Days', amount: '₹7,000',  status: 'Expiring', mobile:'33984309303', category:'Airbnb',     startDate:'16 October 2026',  endDate:'19 October 2026', paymentMode:'Cash', remarks:'Auto-renewal enabled'},
  { id: 8, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
  { id: 9, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
  { id: 10, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
  { id: 11, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
  { id: 12, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
  { id: 13, member: 'Anjali Verma', property: 'SkyStone',    plan:'5D',planLabel: '5 Days', amount: '₹38,000', status: 'Active',   mobile:'44848494949', category:'Farmhouse',  startDate:'03 Jan 2026',      endDate:'08 Jan 2026',paymentMode:'Cash',remarks:'Auto-renewal enabled'},
];

// ─── Custom Dropdown ──────────────────────────────────────────────────────────

const CustomDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const triggerRef            = useRef(null);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropPos({ x, y: y + height + 4, w: width });
      setOpen(true);
    });
  };

  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>{label}</Text>
      <TouchableOpacity
        ref={triggerRef}
        style={[ddStyles.trigger, open && ddStyles.triggerActive]}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <Text style={ddStyles.triggerText} numberOfLines={1}>{value}</Text>
        <Text style={[ddStyles.arrow, open && ddStyles.arrowUp]}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={ddStyles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[ddStyles.dropdownList, { top: dropPos.y, left: dropPos.x, width: dropPos.w }]}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <TouchableOpacity
                key={opt}
                style={ddStyles.optionRow}
                onPress={() => { onChange(opt); setOpen(false); }}
                activeOpacity={0.7}
              >
                <View style={[ddStyles.checkbox, selected && ddStyles.checkboxSelected]}>
                  {selected && <Text style={ddStyles.checkmark}>✓</Text>}
                </View>
                <Text style={[ddStyles.optionText, selected && ddStyles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
};

// ─── Calendar Picker ──────────────────────────────────────────────────────────

const DAYS_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CalendarPicker = ({ visible, selectedDate, onSelect, onClear, onClose }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const goMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const buildGrid = () => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev   = new Date(viewYear, viewMonth, 0).getDate();
    const cells        = [];
    for (let i = firstWeekday - 1; i >= 0; i--)
      cells.push({ day: daysInPrev - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0 || cells.length < 35)
      cells.push({ day: cells.length - daysInMonth - firstWeekday + 1, cur: false });
    return cells;
  };

  const cells = buildGrid();

  const isSelected = (cell) => {
    if (!cell.cur || !selectedDate) return false;
    const s = parseDate(selectedDate);
    return s.getDate() === cell.day && s.getMonth() === viewMonth && s.getFullYear() === viewYear;
  };

  const isToday = (cell) => {
    if (!cell.cur) return false;
    return cell.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  const handleSelect = (cell) => {
    if (!cell.cur) return;
    const picked = new Date(viewYear, viewMonth, cell.day);
    const dd = String(picked.getDate()).padStart(2, '0');
    const mm = String(picked.getMonth() + 1).padStart(2, '0');
    onSelect(`${dd}/${mm}/${picked.getFullYear()}`);
    onClose();
  };

  const handleToday = () => {
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    onSelect(`${dd}/${mm}/${today.getFullYear()}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={calStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={calStyles.card}>
        <View style={calStyles.headerRow}>
          <TouchableOpacity style={calStyles.monthBtn} activeOpacity={0.7}>
            <Text style={calStyles.monthText}>{MONTHS_LONG[viewMonth]} {viewYear}</Text>
            <Text style={calStyles.monthArrow}>▾</Text>
          </TouchableOpacity>
          <View style={calStyles.navBtns}>
            <TouchableOpacity style={calStyles.navBtn} onPress={() => goMonth(-1)} activeOpacity={0.7}>
              <Text style={calStyles.navArrow}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={calStyles.navBtn} onPress={() => goMonth(1)} activeOpacity={0.7}>
              <Text style={calStyles.navArrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={calStyles.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => (
            <Text key={i} style={calStyles.dayLabel}>{d}</Text>
          ))}
        </View>

        <View style={calStyles.grid}>
          {cells.map((cell, i) => {
            const sel = isSelected(cell);
            const tod = isToday(cell) && !sel;
            return (
              <TouchableOpacity
                key={i}
                style={[calStyles.cell, sel && calStyles.cellSelected]}
                onPress={() => handleSelect(cell)}
                activeOpacity={cell.cur ? 0.7 : 1}
              >
                <Text style={[
                  calStyles.cellText,
                  !cell.cur && calStyles.cellTextOther,
                  tod       && calStyles.cellTextToday,
                  sel       && calStyles.cellTextSel,
                ]}>
                  {cell.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={calStyles.footer}>
          <TouchableOpacity onPress={() => { onClear(); onClose(); }} activeOpacity={0.7}>
            <Text style={calStyles.footerClear}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToday} activeOpacity={0.7}>
            <Text style={calStyles.footerToday}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Date Input ───────────────────────────────────────────────────────────────

const DateInput = ({ label, value, onChange }) => {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <View style={dateStyles.wrapper}>
      <Text style={dateStyles.label}>{label}</Text>
      <TouchableOpacity style={dateStyles.input} activeOpacity={0.8} onPress={() => setCalOpen(true)}>
        <Text style={value ? dateStyles.valueText : dateStyles.placeholder}>
          {value || 'dd/mm/yyyy'}
        </Text>
        <Image
          source={require('../../Assets/icons/calendar.png')}
          style={dateStyles.calIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <CalendarPicker
        visible={calOpen}
        selectedDate={value}
        onSelect={onChange}
        onClear={() => onChange('')}
        onClose={() => setCalOpen(false)}
      />
    </View>
  );
};

// ─── Filters Panel ────────────────────────────────────────────────────────────

const FiltersPanel = ({ isEnquiry, filters, setFilters, onApply, onClear, onCollapse }) => {
  const statusOptions = isEnquiry ? ENQ_STATUS_OPTIONS : SUB_STATUS_OPTIONS;
  const set = (key) => (val) => setFilters((prev) => ({ ...prev, [key]: val }));

  return (
    <View style={fpStyles.card}>
      <View style={fpStyles.headerRow}>
        <View style={fpStyles.headerLeft}>
          <View style={fpStyles.iconBox}>
            <Image
              source={require('../../Assets/icons/ak.png')}
              style={fpStyles.filterIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={fpStyles.headerLabel}>FILTERS</Text>
        </View>
        <TouchableOpacity style={fpStyles.collapseBtn} onPress={onCollapse} activeOpacity={0.8}>
           <Image
              source={require('../../Assets/icons/dropdown.png')}
              style={fpStyles.collapseIcon}
              resizeMode="contain"
            />
        </TouchableOpacity>
        
      </View>

      <View style={fpStyles.divider} />

      <View style={fpStyles.row}>
        <CustomDropdown label="CATEGORY" options={CATEGORY_OPTIONS} value={filters.category} onChange={set('category')} />
        <CustomDropdown label="PROPERTY" options={PROPERTY_OPTIONS} value={filters.property} onChange={set('property')} />
      </View>

      <View style={fpStyles.row}>
        <CustomDropdown label="STATUS" options={statusOptions} value={filters.status} onChange={set('status')} />
        {isEnquiry ? (
          <CustomDropdown label="PERIOD" options={PERIOD_OPTIONS} value={filters.period} onChange={set('period')} />
        ) : (
          <CustomDropdown label="DURATION" options={DURATION_OPTIONS} value={filters.duration} onChange={set('duration')} />
        )}
      </View>

      {!isEnquiry && (
        <View style={fpStyles.row}>
          <CustomDropdown label="PAYMENT MODE" options={PAYMENT_OPTIONS} value={filters.paymentMode} onChange={set('paymentMode')} />
          <CustomDropdown label="PERIOD" options={PERIOD_OPTIONS} value={filters.period} onChange={set('period')} />
        </View>
      )}

      <View style={fpStyles.row}>
        <DateInput label="FROM DATE" value={filters.fromDate} onChange={set('fromDate')} />
        <DateInput label="TO DATE"   value={filters.toDate}   onChange={set('toDate')}   />
      </View>

      <View style={fpStyles.btnRow}>
        <TouchableOpacity style={fpStyles.clearBtn} onPress={onClear} activeOpacity={0.8}>
          <Text style={fpStyles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={fpStyles.applyBtn} onPress={onApply} activeOpacity={0.8}>
          <Text style={fpStyles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Default Filters ──────────────────────────────────────────────────────────

const defaultFilters = () => ({
  category:    'All',
  property:    'All',
  status:      'All',
  period:      'This Month',
  duration:    'All',
  paymentMode: 'All',
  fromDate:    '',
  toDate:      '',
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ReportsScreen = ({ navigation }) => {

  const [activeTab,   setActiveTab]   = useState('Enquiry');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters,     setFilters]     = useState(defaultFilters());

  const isEnquiry   = activeTab === 'Enquiry';
  const stats       = isEnquiry ? ENQUIRY_STATS     : SUBSCRIPTION_STATS;
  const tableData   = isEnquiry ? ENQUIRY_DATA      : SUBSCRIPTION_DATA;
  const tableTitle  = isEnquiry ? 'ENQUIRY RECORDS' : 'SUBSCRIPTION RECORDS';
  const exportLabel = isEnquiry ? 'Export Enquiry Report' : 'Export Subscription Report';
  const headerSub   = isEnquiry ? 'Enquiry Report'  : 'Subscription Report';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFilters(defaultFilters());
    setFiltersOpen(false);
  };

  const handleApply    = () => setFiltersOpen(false);
  const handleClear    = () => setFilters(defaultFilters());
  const handleCollapse = () => setFiltersOpen(false);

  // ── Row pe click → navigate to EnquiryRecords screen ──────────────────────

  const handleEnquiryPress = (item) => {
    navigation.navigate('EnquiryRecords', { enquiry: item });
  };

  const handleSubPress = (item) => {
  navigation.navigate('SubscriptionRecords', { subscription: item });
};

  // ── Enquiry Row ─────────────────────────────────────────────────────────────

  const renderEnquiryRow = ({ item, index }) => {
    const s = ENQUIRY_STATUS_STYLE[item.status] ?? ENQUIRY_STATUS_STYLE.Pending;
    return (
      <>
        <TouchableOpacity
          style={styles.tableRow}
          activeOpacity={0.7}
          onPress={() => handleEnquiryPress(item)}
        >
          <Text style={styles.colSerial}>{item.id}</Text>
          <Text style={styles.colName}     numberOfLines={2}>{item.name}</Text>
          <Text style={styles.colProperty} numberOfLines={2}>{item.property}</Text>
          <Text style={styles.colDate}>{item.date}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
          </View>
        </TouchableOpacity>
        {index < tableData.length - 1 && <View style={styles.rowDivider} />}
      </>
    );
  };

  // ── Subscription Row ────────────────────────────────────────────────────────

  const renderSubRow = ({ item, index }) => {
    const s = SUB_STATUS_STYLE[item.status] ?? SUB_STATUS_STYLE.Active;
    return (
      <>
        <TouchableOpacity  style={styles.tableRow}
  activeOpacity={0.7}
  onPress={() => handleSubPress(item)}
>
          
          <Text style={styles.colSerial}>{item.id}</Text>
          <Text style={styles.colSubMember}   numberOfLines={2}>{item.member}</Text>
          <Text style={styles.colSubProperty} numberOfLines={2}>{item.property}</Text>
          <Text style={styles.colSubPlan}>{item.plan}</Text>
          <Text style={styles.colSubAmount}>{item.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
          </View>
        </TouchableOpacity>
        {index < tableData.length - 1 && <View style={styles.rowDivider} />}
      </>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Image source={require('../../Assets/icons/ak.png')} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>

      <TouchableOpacity
       style={styles.downloadBtn}
       activeOpacity={0.8}
    >
      <Image
        source={require('../../Assets/icons/download.png')}
        style={styles.downloadicon}
        resizeMode="contain"
        onPress={()=> {
        }}
      />
    </TouchableOpacity>

        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />
      </View>

      {/* SCROLLABLE BODY */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* TAB SWITCHER */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, isEnquiry && styles.tabBtnActive]}
            onPress={() => handleTabSwitch('Enquiry')}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../Assets/icons/reports2.png')}
              style={[styles.tabIcon, { tintColor: isEnquiry ? Colors.primary : Colors.text_grey }]}
              resizeMode="contain"
            />
            <Text style={[styles.tabBtnText, isEnquiry && styles.tabBtnTextActive]}>Enquiry </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, !isEnquiry && styles.tabBtnActive]}
            onPress={() => handleTabSwitch('Subscription')}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../Assets/icons/sub.png')}
              style={[styles.tabIcon, { tintColor: !isEnquiry ? Colors.primary : Colors.text_grey }]}
              resizeMode="contain"
            />
            <Text style={[styles.tabBtnText, !isEnquiry && styles.tabBtnTextActive]}>Subscription </Text>
          </TouchableOpacity>
        </View>

        {/* STATS CARDS */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.key} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statSub, { color: stat.subColor }]}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* FILTERS */}
        {filtersOpen ? (
          <FiltersPanel
            isEnquiry={isEnquiry}
            filters={filters}
            setFilters={setFilters}
            onApply={handleApply}
            onClear={handleClear}
            onCollapse={handleCollapse}
          />
        ) : (
          <TouchableOpacity style={styles.filtersCollapsedCard} onPress={() => setFiltersOpen(true)} activeOpacity={0.7}>
            <View style={styles.filtersLeft}>
              <View style={styles.filtersIconBox}>
                <Image
                  source={require('../../Assets/icons/ak.png')}
                  style={styles.filtersIconImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.filtersLabel}>FILTERS</Text>
            </View>
            <TouchableOpacity style={styles.expandBtn} onPress={() => setFiltersOpen(true)} activeOpacity={0.7}>
               <Image
                  source={require('../../Assets/icons/dropdown.png')}
                  style={styles.dropdown}
                  resizeMode="contain"
                />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* TABLE CARD */}
        <View style={styles.tableCard}>
          <View style={styles.tableTopRow}>
            <Text style={styles.tableTitle}>{tableTitle}</Text>
            <View style={styles.recordsBadge}>
              <Text style={styles.recordsBadgeText}>{tableData.length} records</Text>
            </View>
          </View>

          {isEnquiry ? (
            <View style={styles.colHeaderRow}>
              <Text style={[styles.colHeaderText, { width: 24 }]}>#</Text>
              <Text style={[styles.colHeaderText, { flex: 1 }]}>NAME</Text>
              <Text style={[styles.colHeaderText, { flex: 1 }]}>PROPERTY</Text>
              <Text style={[styles.colHeaderText, { width: 41 }]}>DATE</Text>
              <Text style={[styles.colHeaderText, { width: 72, textAlign: 'center' }]}>STATUS</Text>
            </View>
          ) : (
            <View style={styles.colHeaderRow}>
              <Text style={[styles.colHeaderText, { width: 20 }]}>#</Text>
              <Text style={[styles.colHeaderText, { width: 62 }]}>MEMBER</Text>
              <Text style={[styles.colHeaderText, { width: 66 }]}>PROPERTY</Text>
              <Text style={[styles.colHeaderText, { width: 34 }]}>PLAN</Text>
              <Text style={[styles.colHeaderText, { width: 58 }]}>AMOUNT</Text>
              <Text style={[styles.colHeaderText, { width: 66, textAlign: 'center' }]}>STATUS</Text>
            </View>
          )}

          <FlatList
            data={tableData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={isEnquiry ? renderEnquiryRow : renderSubRow}
            scrollEnabled={false}
          />
        </View>

      

      </ScrollView>

    </SafeAreaView>
  );
};

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: Colors.page_bg,
  },

  header: {
    backgroundColor:   Colors.bg_dark,
    paddingHorizontal: 20,
    paddingTop:        8,
    paddingBottom:     26,
    flexDirection:     'row',
    alignItems:        'center',
    overflow:          'hidden',
     marginTop: 27,
  },

  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     16,
  },

  backIcon: {
    width:     20,
    height:    20,
    tintColor: Colors.text_white,
  },

  headerTextCol: {
    flex: 1,
  },

  headerTitle: {
    color:      Colors.text_white,
    fontSize:   F.f18,
    fontWeight: 'bold',
  },

  headerSub: {
    color:     Colors.text_grey,
    fontSize:  F.f13,
    marginTop: 2,
  },

  headerCircleLarge: {
    position:        'absolute',
    right:           -24,
    top:             -24,
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: Colors.overlay_circle,
  },

  headerCircleSmall: {
    position:        'absolute',
    right:           54,
    bottom:          -20,
    width:           60,
    height:          60,
    borderRadius:    30,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },

  body: {
    flex:            1,
    backgroundColor: Colors.page_bg,
  },

  bodyContent: {
    paddingHorizontal: 16,
    paddingTop:        20,
    paddingBottom:     32,
    gap:               14,
  },

  tabSwitcher: {
    flexDirection:   'row',
    backgroundColor: Colors.card_bg,
    borderRadius:    14,
    padding:         5,
    ...cardShadow,
  },

  tabBtn: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 13,
    borderRadius:    10,
    gap:             8,
  },

  tabBtnActive: {
    backgroundColor: Colors.bg_dark,
  },

  tabIcon: {
    width:  16,
    height: 16,
  },

  tabBtnText: {
    color:      Colors.text_grey,
    fontSize:   F.f13,
    fontWeight: '600',
  },

  tabBtnTextActive: {
    color:      Colors.text_white,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap:           10,
  },

  statCard: {
    flex:              1,
    backgroundColor:   Colors.card_bg,
    borderRadius:      12,
    paddingHorizontal: 10,
    paddingVertical:   14,
    alignItems:        'flex-start',
    ...cardShadow,
  },

  downloadBtn: {
  width: 30,
  height: 30,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.10)',
  alignItems: 'center',
  justifyContent: 'center',
},

downloadicon:{
   width:     18,
    height:    18,
    
},

  statLabel: {
    color:         Colors.text_grey,
    fontSize:      F.f11,
    fontWeight:    '600',
    letterSpacing: 0.5,
    marginBottom:  8,
  },

  statValue: {
    color:        Colors.text_dark,
    fontSize:     F.f22,
    fontWeight:   'bold',
    marginBottom: 4,
  },

  statSub: {
    fontSize:   F.f12,
    fontWeight: '600',
  },

  filtersCollapsedCard: {
    backgroundColor:   Colors.card_bg,
    borderRadius:      14,
    paddingHorizontal: 16,
    paddingVertical:   14,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    ...cardShadow,
  },

  filtersLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },

  filtersIconBox: {
    width:           30,
    height:          30,
    borderRadius:    10,
    backgroundColor: Colors.bg_dark,
    alignItems:      'center',
    justifyContent:  'center',
  },

  filtersIconImg: {
    width:     15,
    height:    15,
    tintColor: Colors.primary,
  },

  dropdown: {
    width:     18,
    height:    18,
    tintColor: Colors.text_dark,
  },

  filtersLabel: {
    color:         Colors.text_dark,
    fontSize:      F.f12,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },

  expandBtn: {
    backgroundColor:   Colors.gold_bg,
    paddingHorizontal: 16,
    paddingVertical:   5,
    borderRadius:      20,
  },


  tableCard: {
    backgroundColor: Colors.card_bg,
    borderRadius:    14,
    overflow:        'hidden',
    ...cardShadow,
  },

  tableTopRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     12,
  },

  tableTitle: {
    color:         Colors.text_dark,
    fontSize:      F.f13,
    fontWeight:    '800',
    letterSpacing: 0.8,
  },

  recordsBadge: {
    backgroundColor:   Colors.page_bg,
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   4,
  },

  recordsBadgeText: {
    color:      Colors.text_grey,
    fontSize:   F.f12,
    fontWeight: '600',
  },

  colHeaderRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 10,
    paddingVertical:   10,
    borderTopWidth:    1,
    borderBottomWidth: 1,
    borderColor:       Colors.inputBorder,
  },

  colHeaderText: {
    color:         Colors.text_grey,
    fontSize:      F.f10,
    fontWeight:    '700',
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 10,
    paddingVertical:   14,
  },

  colSerial: {
    width:      24,
    color:      Colors.text_grey,
    fontSize:   F.f10,
    fontWeight: '600',
  },

  colName: {
    flex:       1,
    color:      Colors.text_dark,
    fontSize:   F.f10,
    fontWeight: '600',
  },

  colProperty: {
    flex:     1,
    color:    Colors.text_label,
    fontSize: F.f10,
  },

  colDate: {
    width:    50,
    color:    Colors.text_dark,
    fontSize: F.f10,
  },

  colSubMember: {
    width:      62,
    color:      Colors.text_dark,
    fontSize:   F.f10,
    fontWeight: '600',
  },

  colSubProperty: {
    width:    66,
    color:    Colors.text_label,
    fontSize: F.f10,
  },

  colSubPlan: {
    width:      34,
    color:      Colors.text_dark,
    fontSize:   F.f10,
    fontWeight: '600',
  },

  colSubAmount: {
    width:      58,
    color:      Colors.text_dark,
    fontSize:   F.f10,
    fontWeight: '600',
  },

  statusBadge: {
    width:           66,
    alignItems:      'center',
    paddingVertical: 5,
    borderRadius:    20,
  },

  statusText: {
    fontSize:   F.f10,
    fontWeight: '700',
  },

  rowDivider: {
    height:           1,
    backgroundColor:  Colors.inputBorder,
    marginHorizontal: 10,
  },

  exportBtn: {
    backgroundColor: Colors.card_bg,
    borderRadius:    14,
    paddingVertical: 18,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
    ...cardShadow,
  },

  exportIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_dark,
  },

  exportText: {
    color:      Colors.text_dark,
    fontSize:   F.f15,
    fontWeight: '700',
  },

});

// ─── Dropdown Styles ──────────────────────────────────────────────────────────

const ddStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: {
    color:         Colors.text_label,
    fontSize:      F.f11,
    fontWeight:    '700',
    letterSpacing: 0.6,
    marginBottom:  6,
  },
  trigger: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.inputBg,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical:   12,
  },
  triggerActive: {
    borderColor:     Colors.blue_text,
    backgroundColor: '#EFF6FF',
  },
  triggerText: {
    color:      Colors.text_dark,
    fontSize:   F.f14,
    fontWeight: '500',
    flex:       1,
  },
  arrow: {
    color:      Colors.text_grey,
    fontSize:   F.f13,
    marginLeft: 4,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  backdrop: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  dropdownList: {
    position:        'absolute',
    backgroundColor: Colors.card_bg,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     Colors.inputBorder,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  optionRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   13,
    gap:               12,
  },
  checkbox: {
    width:           18,
    height:          18,
    borderRadius:    6,
    borderWidth:     2,
    borderColor:     Colors.inputBorder,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.card_bg,
  },
  checkboxSelected: {
    backgroundColor: Colors.bg_dark,
    borderColor:     Colors.bg_dark,
  },
  checkmark: {
    color:      Colors.text_white,
    fontSize:   F.f10,
    fontWeight: '700',
  },
  optionText: {
    color:    Colors.text_dark,
    fontSize: F.f12,
  },
  optionTextSelected: {
    fontWeight: '700',
  },
});

// ─── Filters Panel Styles ─────────────────────────────────────────────────────

const fpStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card_bg,
    borderRadius:    16,
    padding:         16,
    gap:             16,
    
    ...cardShadow,
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  iconBox: {
    width:           30,
    height:          30,
    borderRadius:    10,
    backgroundColor: Colors.bg_dark,
    alignItems:      'center',
    justifyContent:  'center',
  },
  filterIcon: {
    width:     15,
    height:    15,
    tintColor: Colors.primary,
  },
  headerLabel: {
    color:         Colors.text_dark,
    fontSize:      F.f14,
    fontWeight:    '800',
    letterSpacing: 0.8,
  },
  collapseBtn: {
    borderWidth:       1.5,
    borderColor:       Colors.primary,
    borderRadius:      20,
    paddingHorizontal: 16,
    paddingVertical:   5,
  },

  collapseIcon:{
    width:     18,
    height:    18,
    tintColor: Colors.text_dark,
  },
 
  divider: {
    height:           1,
    backgroundColor:  Colors.inputBorder,
    marginHorizontal: -16,
  },
  row:    { flexDirection: 'row', gap: 12 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  clearBtn: {
    flex:            1,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     Colors.inputBorder,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 14,
  },
  clearBtnText: {
    color:      Colors.text_grey,
    fontSize:   F.f14,
    fontWeight: '600',
  },
  applyBtn: {
    flex:            2.2,
    borderRadius:    12,
    backgroundColor: Colors.bg_dark,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 14,
  },
  applyBtnText: {
    color:      Colors.text_white,
    fontSize:   F.f14,
    fontWeight: '700',
  },
});

// ─── Date Input Styles ────────────────────────────────────────────────────────

const dateStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: {
    color:         Colors.text_label,
    fontSize:      F.f11,
    fontWeight:    '700',
    letterSpacing: 0.6,
    marginBottom:  6,
  },
  input: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.inputBg,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical:   12,
  },
  placeholder: { color: Colors.text_grey, fontSize: F.f14 },
  valueText:   { color: Colors.text_dark, fontSize: F.f14 },
  calIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_grey,
  },
});

// ─── Calendar Styles ──────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  backdrop: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    position:        'absolute',
    top:             '20%',
    alignSelf:       'center',
    width:           300,
    backgroundColor: Colors.card_bg,
    borderRadius:    18,
    padding:         20,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 14 },
    }),
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   18,
  },
  monthBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText:  { color: Colors.text_dark, fontSize: F.f16, fontWeight: '700' },
  monthArrow: { color: Colors.text_grey, fontSize: F.f12 },
  navBtns:    { flexDirection: 'row', gap: 16 },
  navBtn:     { padding: 4 },
  navArrow:   { color: Colors.text_dark, fontSize: F.f18, fontWeight: '300' },
  dayLabelRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginBottom:   8,
  },
  dayLabel: {
    width:      32,
    textAlign:  'center',
    color:      Colors.text_grey,
    fontSize:   F.f13,
    fontWeight: '600',
  },
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    justifyContent: 'space-around',
    rowGap:         4,
  },
  cell:          { width: 32, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  cellSelected:  { backgroundColor: '#1D6AFF', borderRadius: 10 },
  cellText:      { color: Colors.text_dark, fontSize: F.f14 },
  cellTextOther: { color: Colors.text_grey },
  cellTextToday: { color: '#1D6AFF', fontWeight: '700' },
  cellTextSel:   { color: '#FFFFFF', fontWeight: '700' },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      18,
    paddingTop:     14,
    borderTopWidth: 1,
    borderColor:    Colors.inputBorder,
  },
  footerClear: { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
  footerToday: { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
});

export default ReportsScreen;