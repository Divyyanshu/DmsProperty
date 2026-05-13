import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  Modal,
} from 'react-native';


// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark:        '#0F172A',
  primary:        '#F59E0B',
  text_white:     '#F1F5F9',
  text_grey:      '#94A3B8',
  text_dark:      '#1E293B',
  text_label:     '#64748B',
  inputBgColor:   '#F1F5F9',
  inputBorder:    '#E2E8F0',
  inputIcon:      '#94A3B8',
  card_bg:        '#FFFFFF',
  gold_icon_bg:   '#F59E0B',
  dark_icon_bg:   '#1E293B',
  page_bg:        '#EEF0F6',
  divider:        '#E2E8F0',
  chip_bg:        '#F1F5F9',
  chip_active_bg: '#0F172A',
  gender_bg:      '#E8ECF4',
  red_text:       '#EF4444',
  red_bg:         'rgba(239,68,68,0.12)',
};

const F = {
  f11: 11, f12: 12, f13: 13, f14: 14,
  f15: 15, f16: 16, f18: 18, f20: 20, f22: 22,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATA
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'gym',       label: 'Gym',       emoji: '🏋️' },
  { key: 'farmhouse', label: 'Farmhouse', emoji: '🌾'  },
  { key: 'airbnb',    label: 'Airbnb',    emoji: '🏠'  },
];

const PROPERTIES = {
  gym: [
    { key: 'g1', label: "Raja Park",    badge: 'Gym', emoji: '🏋️' },
    { key: 'g2', label: 'Summer Nagar', badge: 'Gym', emoji: '🏋️' },
  ],
  farmhouse: [
    { key: 'f1', label: 'Grey Stone', badge: 'Farmhouse', emoji: '🌾' },
    { key: 'f2', label: 'SkyStone',   badge: 'Farmhouse', emoji: '🌾' },
  ],
  airbnb: [
    { key: 'a1', label: 'Topaz',    badge: '2 BHK', emoji: '🔷' },
    { key: 'a2', label: 'Ruby',     badge: '1 BHK', emoji: '🔴' },
    { key: 'a3', label: 'Sapphire', badge: '1 BHK', emoji: '💙' },
  ],
};

const DURATIONS = [
  { key: '1m', num: '1', sub: 'MONTH'  },
  { key: '3m', num: '3', sub: 'MONTHS' },
  { key: '6m', num: '6', sub: 'MONTHS' },
  { key: '1y', num: '1', sub: 'YEAR'   },
];

const GYM_SERVICES = [
  'Weight Training',
  'Cardio',
  'Zumba',
  'Yoga',
  'CrossFit',
  'Swimming',
  'Personal Training',
  'Group Classes',
  'Pilates',
  'Kickboxing',
  'Cycling',
  'Steam / Sauna',
  'Locker',
  'Other',
];

const CUSTOMER_ICON_BG = {
  gym:       Colors.dark_icon_bg,
  farmhouse: Colors.gold_icon_bg,
  airbnb:    Colors.gold_icon_bg,
};

const CUSTOMER_EMOJI = {
  gym: '👤', farmhouse: '🌾', airbnb: '🏠',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CALENDAR PICKER
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_LONG = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CalendarPicker = ({ visible, selectedDate, onSelect, onClear, onClose }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (visible) {
      const base = selectedDate ? parseDate(selectedDate) : today;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
  }, [visible]);

  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const goMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0;  y++; }
    if (m <  0) { m = 11; y--; }
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
      <TouchableOpacity style={calSt.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={calSt.card}>
        <View style={calSt.headerRow}>
          <TouchableOpacity style={calSt.monthBtn} activeOpacity={0.7}>
            <Text style={calSt.monthText}>{MONTHS_LONG[viewMonth]} {viewYear}</Text>
            <Text style={calSt.monthArrow}>▾</Text>
          </TouchableOpacity>
          <View style={calSt.navBtns}>
            <TouchableOpacity style={calSt.navBtn} onPress={() => goMonth(-1)} activeOpacity={0.7}>
              <Text style={calSt.navArrow}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={calSt.navBtn} onPress={() => goMonth(1)} activeOpacity={0.7}>
              <Text style={calSt.navArrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={calSt.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => (
            <Text key={i} style={calSt.dayLabel}>{d}</Text>
          ))}
        </View>
        <View style={calSt.grid}>
          {cells.map((cell, i) => {
            const sel = isSelected(cell);
            const tod = isToday(cell) && !sel;
            return (
              <TouchableOpacity
                key={i}
                style={[calSt.cell, sel && calSt.cellSelected]}
                onPress={() => handleSelect(cell)}
                activeOpacity={cell.cur ? 0.7 : 1}
              >
                <Text style={[
                  calSt.cellText,
                  !cell.cur && calSt.cellTextOther,
                  tod       && calSt.cellTextToday,
                  sel       && calSt.cellTextSel,
                ]}>
                  {cell.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={calSt.footer}>
          <TouchableOpacity onPress={() => { onClear(); onClose(); }} activeOpacity={0.7}>
            <Text style={calSt.footerClear}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToday} activeOpacity={0.7}>
            <Text style={calSt.footerToday}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({ iconEmoji, iconBg = Colors.dark_icon_bg, title, children }) => (
  <View style={sectionCardSt.card}>
    <View style={sectionCardSt.headerRow}>
      <View style={[sectionCardSt.iconBox, { backgroundColor: iconBg }]}>
        <Text style={sectionCardSt.iconEmoji}>{iconEmoji}</Text>
      </View>
      <Text style={sectionCardSt.title}>{title}</Text>
      <View style={sectionCardSt.dividerLine} />
    </View>
    <View style={sectionCardSt.content}>{children}</View>
  </View>
);

const FieldLabel = ({ text, required }) => (
  <View style={fieldLabelSt.row}>
    <View style={fieldLabelSt.dot} />
    <Text style={fieldLabelSt.text}>{text}{required ? ' *' : ''}</Text>
  </View>
);

const FormInput = ({ placeholder, value, onChangeText, icon, keyboardType, multiline, numberOfLines, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[
      inputSt.wrapper,
      focused   && inputSt.wrapperFocused,
      multiline && inputSt.wrapperMultiline,
      style,
    ]}>
      {icon && <Image source={icon} style={inputSt.icon} resizeMode="contain" />}
      <TextInput
        style={[inputSt.input, multiline && inputSt.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const DateInput = ({ value, onChange }) => {
  const [calOpen, setCalOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={inputSt.wrapper}
        onPress={() => setCalOpen(true)}
        activeOpacity={0.8}
      >
        <Image
          source={require('../../Assets/icons/calendar.png')}
          style={inputSt.icon}
          resizeMode="contain"
        />
        <Text style={[inputSt.input, !value && { color: Colors.text_grey }]}>
          {value || 'dd/mm/yyyy'}
        </Text>
        <Image
          source={require('../../Assets/icons/calendar.png')}
          style={inputSt.calIcon}
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

const HalfDateInput = ({ label, val, onChange }) => {
  const [calOpen, setCalOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel text={label} />
      <TouchableOpacity
        style={inputSt.wrapper}
        onPress={() => setCalOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={{ flex: 1, color: val ? Colors.text_dark : Colors.text_grey, fontSize: F.f13 }}>
          {val || 'dd/mm/yyyy'}
        </Text>
        <Image
          source={require('../../Assets/icons/calendar.png')}
          style={inputSt.calIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <CalendarPicker
        visible={calOpen}
        selectedDate={val}
        onSelect={onChange}
        onClear={() => onChange('')}
        onClose={() => setCalOpen(false)}
      />
    </View>
  );
};

const DateRow = ({ leftLabel, rightLabel, leftVal, rightVal, onLeftChange, onRightChange }) => (
  <View style={{ flexDirection: 'row', gap: 10 }}>
    <HalfDateInput label={leftLabel}  val={leftVal}  onChange={onLeftChange}  />
    <HalfDateInput label={rightLabel} val={rightVal} onChange={onRightChange} />
  </View>
);

const AmountInput = ({ value, onChangeText }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[inputSt.wrapper, focused && inputSt.wrapperFocused, amtSt.wrapperOverride]}>
      <View style={amtSt.prefix}>
        <Text style={amtSt.symbol}>₹</Text>
      </View>
      <TextInput
        style={[inputSt.input, amtSt.inputOverride]}
        placeholder="Enter estimated amount"
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const CustomDropdown = ({ placeholder, selected, items, onSelect, open, onToggle }) => (
  <View>
    <TouchableOpacity
      style={[dropSt.trigger, open && dropSt.triggerOpen]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={selected ? dropSt.selectedText : dropSt.placeholder}>
        {selected ? `${selected.emoji}  ${selected.label}` : placeholder}
      </Text>
      <Text style={[dropSt.arrow, open && dropSt.arrowUp]}>▼</Text>
    </TouchableOpacity>
    {open && (
      <View style={dropSt.list}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[dropSt.item, idx < items.length - 1 && dropSt.itemBorder]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={dropSt.itemEmoji}>{item.emoji}</Text>
            <Text style={dropSt.itemLabel}>{item.label}</Text>
            {item.badge && <Text style={dropSt.itemBadge}>{item.badge}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const GenderSelector = ({ value, onChange }) => (
  <View style={genderSt.container}>
    {['Male', 'Female', 'Other'].map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[genderSt.btn, value === opt && genderSt.btnActive]}
        onPress={() => onChange(opt)}
        activeOpacity={0.8}
      >
        <Text style={[genderSt.label, value === opt && genderSt.labelActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const DurationChips = ({ value, onChange }) => (
  <View style={chipSt.row}>
    {DURATIONS.map((d) => {
      const active = value === d.key;
      return (
        <TouchableOpacity
          key={d.key}
          style={[chipSt.chip, active && chipSt.chipActive]}
          onPress={() => onChange(d.key)}
          activeOpacity={0.8}
        >
          <Text style={[chipSt.num, active && chipSt.numActive]}>{d.num}</Text>
          <Text style={[chipSt.sub, active && chipSt.subActive]}>{d.sub}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. SERVICE ROW
// ─────────────────────────────────────────────────────────────────────────────

const ServiceRow = ({ index, service, onServiceChange, onAmountChange, onRemove }) => {
  const [ddOpen,  setDdOpen]  = useState(false);
  const [focused, setFocused] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const triggerRef            = useRef(null);

  const amount    = parseInt(service.amount || '0', 10);
  const increment = () => onAmountChange(String(amount + 100));
  const decrement = () => { if (amount > 0) onAmountChange(String(amount - 100)); };

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropPos({ x, y: y + height, w: width });
      setDdOpen(true);
    });
  };

  return (
    <View style={svcSt.row}>

      <View style={svcSt.indexBadge}>
        <Text style={svcSt.indexText}>{index}</Text>
      </View>

      <View style={svcSt.dropWrap}>
        <TouchableOpacity
          ref={triggerRef}
          style={[svcSt.dropTrigger, ddOpen && svcSt.dropTriggerOpen]}
          onPress={openDropdown}
          activeOpacity={0.8}
        >
          <Text
            style={service.name ? svcSt.dropSelected : svcSt.dropPlaceholder}
            numberOfLines={1}
          >
            {service.name || 'Select Service'}
          </Text>
          <Text style={[svcSt.dropArrow, ddOpen && svcSt.dropArrowUp]}>▾</Text>
        </TouchableOpacity>

        <Modal
          visible={ddOpen}
          transparent
          animationType="none"
          onRequestClose={() => setDdOpen(false)}
        >
          <TouchableOpacity
            style={svcSt.dropBackdrop}
            activeOpacity={1}
            onPress={() => setDdOpen(false)}
          />
          <View style={[svcSt.dropList, { top: dropPos.y, left: 16, right: 16 }]}>
            <TouchableOpacity
              style={[svcSt.dropItem, svcSt.dropItemBorder]}
              onPress={() => setDdOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={svcSt.dropItemHeader}>Select Service</Text>
            </TouchableOpacity>
            <ScrollView
              style={svcSt.dropScroll}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {GYM_SERVICES.map((s, i) => {
                const isSelected = service.name === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      svcSt.dropItem,
                      i < GYM_SERVICES.length - 1 && svcSt.dropItemBorder,
                    ]}
                    onPress={() => { onServiceChange(s); setDdOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={svcSt.dropCheckPlaceholder}>
                      {isSelected ? '✓' : ''}
                    </Text>
                    <Text style={[svcSt.dropItemText, isSelected && svcSt.dropItemActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </View>

      <View style={[svcSt.amtWrap, focused && svcSt.amtWrapFocused]}>
        <Text style={svcSt.rupee}>₹</Text>
        <TextInput
          style={svcSt.amtInput}
          value={service.amount || '0'}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <View style={svcSt.stepperCol}>
          <TouchableOpacity style={svcSt.stepBtn} onPress={increment} activeOpacity={0.7}>
            <Text style={svcSt.stepArrow}>▲</Text>
          </TouchableOpacity>
          <View style={svcSt.stepDivider} />
          <TouchableOpacity style={svcSt.stepBtn} onPress={decrement} activeOpacity={0.7}>
            <Text style={svcSt.stepArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={svcSt.deleteBtn} onPress={onRemove} activeOpacity={0.7}>
        <Text style={svcSt.deleteX}>✕</Text>
      </TouchableOpacity>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SERVICES & PRICING SECTION
// ─────────────────────────────────────────────────────────────────────────────

const ServicesPricingSection = ({ services, setServices }) => {

  const addService = () => {
    setServices(prev => [...prev, { id: Date.now(), name: '', amount: '0' }]);
  };

  const updateName = (id, name) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateAmount = (id, amount) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, amount } : s));
  };

  const removeService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const total = services.reduce((sum, s) => sum + (parseInt(s.amount || '0', 10)), 0);

  return (
    <SectionCard iconEmoji="💪" iconBg={Colors.dark_icon_bg} title="SERVICES & PRICING">
      {services.map((svc, idx) => (
        <ServiceRow
          key={svc.id}
          index={idx + 1}
          service={svc}
          onServiceChange={(name)  => updateName(svc.id, name)}
          onAmountChange={(amount) => updateAmount(svc.id, amount)}
          onRemove={() => removeService(svc.id)}
        />
      ))}
      <TouchableOpacity style={addSvcSt.btn} onPress={addService} activeOpacity={0.7}>
        <Text style={addSvcSt.text}>＋  Add Service</Text>
      </TouchableOpacity>
      {services.length > 0 && (
        <View style={svcTotalSt.row}>
          <Text style={svcTotalSt.label}>TOTAL AMOUNT</Text>
          <Text style={svcTotalSt.value}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
      )}
    </SectionCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const NewEnquiryScreen = ({ navigation }) => {

  const [categoryOpen,  setCategoryOpen]  = useState(false);
  const [propertyOpen,  setPropertyOpen]  = useState(false);
  const [selectedCat,   setSelectedCat]   = useState(null);
  const [selectedProp,  setSelectedProp]  = useState(null);

  const [fullName,   setFullName]   = useState('');
  const [mobile,     setMobile]     = useState('');
  const [email,      setEmail]      = useState('');
  const [dob,        setDob]        = useState('');
  const [gender,     setGender]     = useState('Male');

  const [duration,   setDuration]   = useState('');
  const [joinDate,   setJoinDate]   = useState('');
  const [notes,      setNotes]      = useState('');

  const [services,   setServices]   = useState([]);

  const [checkIn,    setCheckIn]    = useState('');
  const [checkOut,   setCheckOut]   = useState('');
  const [guests,     setGuests]     = useState('');
  const [adults,     setAdults]     = useState('');
  const [children,   setChildren]   = useState('');
  const [specialReq, setSpecialReq] = useState('');
  const [estAmount,  setEstAmount]  = useState('');

  const handleCategorySelect = (cat) => {
    setSelectedCat(cat);
    setSelectedProp(null);
    setCategoryOpen(false);
    setPropertyOpen(false);
    setServices([]);
  };

  const handlePropertySelect = (prop) => {
    setSelectedProp(prop);
    setPropertyOpen(false);
  };

  const catKey       = selectedCat?.key || '';
  const formUnlocked = selectedCat !== null && selectedProp !== null;
  const submitLabel  = selectedCat ? `Submit ${selectedCat.label} Enquiry` : 'Submit Enquiry';

  return (
    <SafeAreaView style={screenSt.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER */}
      <View style={screenSt.header}>
        <TouchableOpacity
          style={screenSt.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../Assets/icons/ak.png')}
            style={screenSt.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={screenSt.headerTitleBlock}>
          <Text style={screenSt.headerTitle}>New Enquiry</Text>
          <Text style={screenSt.headerSubtitle}>Fill in customer details</Text>
        </View>
        <View style={screenSt.circle1} />
        <View style={screenSt.goldLine} />
      </View>

      {/* SCROLL BODY */}
      <ScrollView
        style={screenSt.body}
        contentContainerStyle={screenSt.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SECTION 1: CATEGORY & PROPERTY */}
        <SectionCard iconEmoji="🏷️" iconBg={Colors.gold_icon_bg} title="SELECT CATEGORY & PROPERTY">
          <View>
            <FieldLabel text="CATEGORY" />
            <CustomDropdown
              placeholder="Choose a category..."
              selected={selectedCat}
              items={CATEGORIES}
              open={categoryOpen}
              onToggle={() => { setCategoryOpen(!categoryOpen); setPropertyOpen(false); }}
              onSelect={handleCategorySelect}
            />
          </View>
          {selectedCat !== null && (
            <View>
              <FieldLabel text={`${selectedCat.label.toUpperCase()} PROPERTY`} />
              <CustomDropdown
                placeholder="Choose a property..."
                selected={selectedProp}
                items={PROPERTIES[selectedCat.key] || []}
                open={propertyOpen}
                onToggle={() => { setPropertyOpen(!propertyOpen); setCategoryOpen(false); }}
                onSelect={handlePropertySelect}
              />
            </View>
          )}
        </SectionCard>

        {formUnlocked && (
          <>
            {/* SECTION 2: CUSTOMER INFO */}
            <SectionCard
              iconEmoji={CUSTOMER_EMOJI[catKey]}
              iconBg={CUSTOMER_ICON_BG[catKey]}
              title="CUSTOMER INFORMATION"
            >
              <View>
                <FieldLabel text="FULL NAME" required />
                <FormInput
                  placeholder="Enter full name"
                  value={fullName}
                  onChangeText={setFullName}
                  icon={require('../../Assets/icons/members.png')}
                />
              </View>
              <View>
                <FieldLabel text="MOBILE NUMBER" required />
                <FormInput
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChangeText={setMobile}
                  icon={require('../../Assets/icons/mobile.png')}
                  keyboardType="phone-pad"
                />
              </View>
              <View>
                <FieldLabel text="EMAIL ID" />
                <FormInput
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  icon={require('../../Assets/icons/mail.png')}
                  keyboardType="email-address"
                />
              </View>
              {catKey === 'gym' && (
                <>
                  <View>
                    <FieldLabel text="DATE OF BIRTH" />
                    <DateInput value={dob} onChange={setDob} />
                  </View>
                  <View>
                    <FieldLabel text="GENDER" />
                    <GenderSelector value={gender} onChange={setGender} />
                  </View>
                </>
              )}
            </SectionCard>

            {catKey === 'gym' && (
              <ServicesPricingSection services={services} setServices={setServices} />
            )}

            {catKey === 'gym' && (
              <SectionCard iconEmoji="📅" iconBg={Colors.dark_icon_bg} title="SUBSCRIPTION DURATION">
                <DurationChips value={duration} onChange={setDuration} />
                <View>
                  <FieldLabel text="EXPECTED JOINING DATE" />
                  <DateInput value={joinDate} onChange={setJoinDate} />
                </View>
              </SectionCard>
            )}

            {catKey === 'gym' && (
              <SectionCard iconEmoji="📝" iconBg={Colors.dark_icon_bg} title="ADDITIONAL NOTES">
                <FormInput
                  placeholder="Special requirements, remarks or follow-up notes..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </SectionCard>
            )}

            {catKey === 'farmhouse' && (
              <SectionCard iconEmoji="📅" iconBg={Colors.gold_icon_bg} title="BOOKING DETAILS">
                <DateRow
                  leftLabel="CHECK-IN"
                  rightLabel="CHECK-OUT"
                  leftVal={checkIn}
                  rightVal={checkOut}
                  onLeftChange={setCheckIn}
                  onRightChange={setCheckOut}
                />
                <View>
                  <FieldLabel text="NO. OF GUESTS" />
                  <FormInput
                    placeholder="Number of guests"
                    value={guests}
                    onChangeText={setGuests}
                    icon={require('../../Assets/icons/members.png')}
                    keyboardType="numeric"
                  />
                </View>
                <View>
                  <FieldLabel text="ESTIMATED AMOUNT" />
                  <AmountInput value={estAmount} onChangeText={setEstAmount} />
                </View>
              </SectionCard>
            )}

            {catKey === 'airbnb' && (
              <SectionCard iconEmoji="📅" iconBg={Colors.gold_icon_bg} title="STAY DETAILS">
                <DateRow
                  leftLabel="CHECK-IN"
                  rightLabel="CHECK-OUT"
                  leftVal={checkIn}
                  rightVal={checkOut}
                  onLeftChange={setCheckIn}
                  onRightChange={setCheckOut}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <FieldLabel text="ADULTS" />
                    <FormInput placeholder="Adults" value={adults} onChangeText={setAdults} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FieldLabel text="CHILDREN" />
                    <FormInput placeholder="Children" value={children} onChangeText={setChildren} keyboardType="numeric" />
                  </View>
                </View>
                <View>
                  <FieldLabel text="SPECIAL REQUESTS" />
                  <FormInput
                    placeholder="Early check-in, extra pillows..."
                    value={specialReq}
                    onChangeText={setSpecialReq}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </SectionCard>
            )}

            {catKey === 'airbnb' && (
              <SectionCard iconEmoji="💰" iconBg={Colors.gold_icon_bg} title="ESTIMATED AMOUNT">
                <AmountInput value={estAmount} onChangeText={setEstAmount} />
              </SectionCard>
            )}

            {/* ── SUBMIT BUTTON ─────────────────────────────────────────── */}
            <TouchableOpacity style={screenSt.submitBtn} activeOpacity={0.85} onPress={() => {}}>
              {/* ✅ Image icon instead of Text tick */}
              <Image
                source={require('../../Assets/icons/check.png')}
                style={screenSt.submitCheckIcon}
                resizeMode="contain"
              />
              <Text style={screenSt.submitText}>{submitLabel}</Text>
            </TouchableOpacity>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewEnquiryScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 8. STYLESHEETS
// ─────────────────────────────────────────────────────────────────────────────

const screenSt = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: Colors.page_bg,
  },
  header: {
    backgroundColor:   Colors.bg_dark,
    paddingHorizontal: 20,
    paddingTop:        8,
    paddingBottom:     24,
    flexDirection:     'row',
    alignItems:        'center',
    overflow:          'hidden',
    marginTop: 27,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     14,
    zIndex:          2,
  },
  backIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_white,
  },
  headerTitleBlock: {
    flex:   1,
    zIndex: 2,
  },
  headerTitle: {
    color:        Colors.text_white,
    fontSize:     F.f18,
    fontWeight:   'bold',
    marginBottom: 3,
  },
  headerSubtitle: {
    color:    Colors.text_grey,
    fontSize: F.f13,
  },
  circle1: {
    position:        'absolute',
    width:           140,
    height:          140,
    borderRadius:    110,
    backgroundColor: Colors.bg_dark,
    top:             -30,
    right:           -40,
    borderColor:     'rgba(202, 156, 41, 0.12)',
    borderWidth:     25,
  },
  goldLine: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          3,
    backgroundColor: Colors.primary,
  },
  body: {
    flex:            1,
    backgroundColor: Colors.page_bg,
  },
  bodyContent: {
    paddingHorizontal: 14,
    paddingTop:        18,
    paddingBottom:     30,
  },
  submitBtn: {
    backgroundColor: Colors.bg_dark,
    borderRadius:    14,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 18,
    marginTop:       6,
    gap:             10,
  },
  // ✅ CHANGED: submitCheck (Text) → submitCheckIcon (Image)
  submitCheckIcon: {
    width:     22,
    height:    22,
    tintColor: Colors.primary,
  },
  submitText: {
    color:         Colors.text_white,
    fontSize:      F.f16,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
});

const sectionCardSt = StyleSheet.create({
  card: {
    backgroundColor: Colors.card_bg,
    borderRadius:    16,
    marginBottom:    14,
    ...Platform.select({
      ios: {
        shadowColor:   '#B0B8C8',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius:  8,
      },
      android: { elevation: 3 },
    }),
  },
  headerRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingTop:        14,
    paddingBottom:     10,
    gap:               10,
  },
  iconBox: {
    width:          35,
    height:         35,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 15,
  },
  title: {
    color:         Colors.text_dark,
    fontSize:      F.f13,
    fontWeight:    '800',
    letterSpacing: 1,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.divider,
    marginLeft:      4,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom:     16,
    gap:               14,
  },
});

const fieldLabelSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginBottom:  6,
  },
  dot: {
    width:           4,
    height:          4,
    borderRadius:    3,
    backgroundColor: Colors.primary,
  },
  text: {
    color:         Colors.text_label,
    fontSize:      F.f11,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },
});

const inputSt = StyleSheet.create({
  wrapper: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.inputBgColor,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 12,
    minHeight:         52,
  },
  wrapperFocused: {
    borderColor:     Colors.primary,
    backgroundColor: '#FFFDF5',
  },
  wrapperMultiline: {
    alignItems:      'flex-start',
    paddingVertical: 12,
    minHeight:       100,
  },
  icon: {
    width:       18,
    height:      18,
    tintColor:   Colors.inputIcon,
    marginRight: 10,
  },
  calIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.bg_dark,
  },
  input: {
    flex:     1,
    color:    Colors.text_dark,
    fontSize: F.f14,
    padding:  0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    lineHeight:        20,
  },
});

const amtSt = StyleSheet.create({
  wrapperOverride: {
    paddingHorizontal: 0,
  },
  prefix: {
    width:                  44,
    alignSelf:              'stretch',
    backgroundColor:        '#FFF8E6',
    borderTopLeftRadius:    10,
    borderBottomLeftRadius: 10,
    alignItems:             'center',
    justifyContent:         'center',
    borderRightWidth:       1,
    borderRightColor:       Colors.inputBorder,
  },
  symbol: {
    color:      Colors.primary,
    fontSize:   F.f18,
    fontWeight: '700',
  },
  inputOverride: {
    paddingHorizontal: 12,
  },
});

const dropSt = StyleSheet.create({
  trigger: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.inputBgColor,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 14,
    height:            52,
  },
  triggerOpen: {
    borderColor:             Colors.primary,
    borderBottomLeftRadius:  0,
    borderBottomRightRadius: 0,
  },
  placeholder: {
    color:    Colors.text_grey,
    fontSize: F.f14,
  },
  selectedText: {
    color:      Colors.text_dark,
    fontSize:   F.f15,
    fontWeight: '700',
  },
  arrow: {
    color:    Colors.text_grey,
    fontSize: F.f12,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  list: {
    backgroundColor:         Colors.card_bg,
    borderTopLeftRadius:     0,
    borderTopRightRadius:    0,
    borderBottomLeftRadius:  12,
    borderBottomRightRadius: 12,
    borderWidth:             1.5,
    borderColor:             Colors.primary,
    borderTopWidth:          0,
    overflow:                'hidden',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius:  8,
      },
      android: { elevation: 6 },
    }),
  },
  item: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   14,
    gap:               12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemEmoji: {
    fontSize: 22,
  },
  itemLabel: {
    flex:       1,
    color:      Colors.text_dark,
    fontSize:   F.f15,
    fontWeight: '700',
  },
  itemBadge: {
    color:      Colors.text_label,
    fontSize:   F.f13,
    fontWeight: '500',
  },
});

const genderSt = StyleSheet.create({
  container: {
    flexDirection:   'row',
    backgroundColor: Colors.gender_bg,
    borderRadius:    12,
    padding:         4,
    gap:             4,
  },
  btn: {
    flex:            1,
    paddingVertical: 10,
    borderRadius:    9,
    alignItems:      'center',
  },
  btnActive: {
    backgroundColor: Colors.card_bg,
    ...Platform.select({
      ios: {
        shadowColor:   '#888',
        shadowOffset:  { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius:  4,
      },
      android: { elevation: 2 },
    }),
  },
  label: {
    color:      Colors.text_grey,
    fontSize:   F.f14,
    fontWeight: '500',
  },
  labelActive: {
    color:      Colors.text_dark,
    fontWeight: '700',
  },
});

const chipSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     12,
  },
  chip: {
    flex:            1,
    backgroundColor: Colors.chip_bg,
    borderRadius:    12,
    paddingVertical: 10,
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     Colors.inputBorder,
  },
  chipActive: {
    backgroundColor: '#f6f0c7',
    borderColor:     Colors.chip_active_bg,
  },
  num: {
    color:      Colors.text_dark,
    fontSize:   F.f22,
    fontWeight: '800',
    lineHeight: 26,
  },
  numActive: {
    color: Colors.text_dark,
  },
  sub: {
    color:         Colors.text_grey,
    fontSize:      F.f11,
    fontWeight:    '600',
    letterSpacing: 0.4,
    marginTop:     2,
  },
  subActive: {
    color: '#94A3B8',
  },
});

const addSvcSt = StyleSheet.create({
  btn: {
    borderWidth:     1.5,
    borderColor:     Colors.divider,
    borderStyle:     'dashed',
    borderRadius:    12,
    paddingVertical: 16,
    alignItems:      'center',
  },
  text: {
    color:         Colors.text_grey,
    fontSize:      F.f14,
    fontWeight:    '500',
    letterSpacing: 0.2,
  },
});

const svcSt = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: '#FFFDF5',
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     Colors.primary,
    padding:         10,
  },
  indexBadge: {
    width:           28,
    height:          28,
    borderRadius:    8,
    backgroundColor: Colors.bg_dark,
    alignItems:      'center',
    justifyContent:  'center',
  },
  indexText: {
    color:      Colors.text_white,
    fontSize:   F.f13,
    fontWeight: '700',
  },
  dropWrap: {
    flex:     1,
    position: 'relative',
  },
  dropTrigger: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.card_bg,
    borderRadius:      10,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 10,
    height:            40,
  },
  dropTriggerOpen: {
    borderColor:             Colors.primary,
    borderBottomLeftRadius:  0,
    borderBottomRightRadius: 0,
  },
  dropPlaceholder: {
    flex:     1,
    color:    Colors.text_grey,
    fontSize: F.f13,
  },
  dropSelected: {
    flex:       1,
    color:      Colors.text_dark,
    fontSize:   F.f13,
    fontWeight: '600',
  },
  dropArrow: {
    color:    Colors.text_grey,
    fontSize: F.f11,
  },
  dropArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropBackdrop: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  dropList: {
    position:        'absolute',
    backgroundColor: '#EFEFEF',
    borderRadius:    12,
    overflow:        'hidden',
    maxHeight:       380,
    width:           140,
    marginLeft:      50,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius:  14,
      },
      android: { elevation: 12 },
    }),
  },
  dropItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    gap:               4,
  },
  dropItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.10)',
  },
  dropItemHeader: {
    color:      Colors.text_dark,
    fontSize:   F.f12,
    fontWeight: '500',
    marginLeft: 12,
  },
  dropCheckPlaceholder: {
    width:      15,
    color:      Colors.text_dark,
    fontSize:   F.f12,
    fontWeight: '600',
    textAlign:  'center',
  },
  dropItemText: {
    color:      Colors.text_dark,
    fontSize:   F.f12,
    fontWeight: '600',
  },
  dropItemActive: {
    fontWeight: '500',
  },
  dropScroll: {
    maxHeight: 320,
  },
  amtWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.card_bg,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     Colors.inputBorder,
    height:          40,
    overflow:        'hidden',
    width:           80,
  },
  amtWrapFocused: {
    borderColor: Colors.primary,
  },
  rupee: {
    color:       Colors.primary,
    fontSize:    F.f15,
    fontWeight:  '700',
    paddingLeft: 8,
  },
  amtInput: {
    flex:              1,
    color:             Colors.text_dark,
    fontSize:          F.f14,
    fontWeight:        '600',
    paddingHorizontal: 6,
    padding:           0,
  },
  stepperCol: {
    borderLeftWidth:  1,
    borderLeftColor:  Colors.inputBorder,
    height:           '100%',
    justifyContent:   'center',
    backgroundColor:  '#F8F9FB',
  },
  stepBtn: {
    paddingHorizontal: 7,
    paddingVertical:   4,
  },
  stepDivider: {
    height:          1,
    backgroundColor: Colors.inputBorder,
  },
  stepArrow: {
    color:    Colors.text_grey,
    fontSize: 8,
  },
  deleteBtn: {
    width:           32,
    height:          32,
    borderRadius:    8,
    backgroundColor: Colors.red_bg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  deleteX: {
    color:      Colors.red_text,
    fontSize:   F.f13,
    fontWeight: '700',
  },
});

const svcTotalSt = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   '#FFF8E6',
    borderRadius:      12,
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderWidth:       1,
    borderColor:       '#F3D99A',
  },
  label: {
    color:         Colors.text_label,
    fontSize:      F.f12,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },
  value: {
    color:      Colors.text_dark,
    fontSize:   F.f20,
    fontWeight: '800',
  },
});

const calSt = StyleSheet.create({
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
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius:  20,
      },
      android: { elevation: 14 },
    }),
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   18,
  },
  monthBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  monthText: {
    color:      Colors.text_dark,
    fontSize:   F.f16,
    fontWeight: '700',
  },
  monthArrow: {
    color:    Colors.text_grey,
    fontSize: F.f12,
  },
  navBtns: {
    flexDirection: 'row',
    gap:           16,
  },
  navBtn: {
    padding: 4,
  },
  navArrow: {
    color:      Colors.text_dark,
    fontSize:   F.f18,
    fontWeight: '300',
  },
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
  cell: {
    width:          32,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   8,
  },
  cellSelected: {
    backgroundColor: '#1D6AFF',
    borderRadius:    10,
  },
  cellText: {
    color:    Colors.text_dark,
    fontSize: F.f14,
  },
  cellTextOther: {
    color: Colors.text_grey,
  },
  cellTextToday: {
    color:      '#1D6AFF',
    fontWeight: '700',
  },
  cellTextSel: {
    color:      '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      18,
    paddingTop:     14,
    borderTopWidth: 1,
    borderColor:    Colors.inputBorder,
  },
  footerClear: {
    color:      '#1D6AFF',
    fontSize:   F.f14,
    fontWeight: '600',
  },
  footerToday: {
    color:      '#1D6AFF',
    fontSize:   F.f14,
    fontWeight: '600',
  },
});