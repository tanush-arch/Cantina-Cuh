import React, { useState } from 'react';
import { Download, Mic, Trash2, CheckCircle2, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';
import AccessibleButton from '../components/AccessibleButton';
import { speechService } from '../services/speechService';
import { generateFormPDF } from '../services/pdfService';
import { useAccessibility } from '../context/AccessibilityContext';

const INITIAL_FORM_DATA = {
  fullName: '',
  phone: '',
  email: '',
  serviceType: 'Reading Assistance',
  preferredContact: 'Phone',
  comments: '',
};

export default function FormAssistant() {
  const { settings, announce } = useAccessibility();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [errors, setErrors] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+()-\s]{7,16}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number (at least 7 digits).';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Read field instructions aloud
  const handleReadInstruction = (fieldName, label, instructions) => {
    const text = `${label}. Instructions: ${instructions}. Current answer is: ${formData[fieldName] || 'Empty'}.`;
    announce(`Reading field ${label}`);
    speechService.speak(text, {
      rate: settings.speechRate,
      lang: settings.speechLanguage,
    });
  };

  // Voice Dictation for specific field
  const handleVoiceInput = (fieldName, label) => {
    if (!speechService.isRecognitionSupported()) {
      announce('Voice dictation is not supported in this browser. Please type your answer.');
      return;
    }

    if (activeVoiceField === fieldName) {
      speechService.stopListening();
      setActiveVoiceField(null);
      announce('Voice dictation stopped.');
      return;
    }

    speechService.stopSpeaking();
    setActiveVoiceField(fieldName);
    announce(`Listening for ${label}. Speak clearly now.`);

    speechService.startListening({
      lang: settings.speechLanguage,
      onResult: (transcript) => {
        setActiveVoiceField(null);
        setFormData((prev) => ({ ...prev, [fieldName]: transcript }));
        const confirmation = `Recorded for ${label}: ${transcript}`;
        announce(confirmation);
        if (settings.spokenFeedback) {
          speechService.speak(confirmation, {
            rate: settings.speechRate,
            lang: settings.speechLanguage,
          });
        }
      },
      onError: (err) => {
        setActiveVoiceField(null);
        announce('Voice input error. Please try again or type manually.');
      },
      onEnd: () => {
        setActiveVoiceField(null);
      },
    });
  };

  const handleProceedToReview = () => {
    if (validate()) {
      setReviewMode(true);
      const msg = 'Form inputs validated successfully. You are now in review mode. You can edit any answers or generate a PDF.';
      announce(msg);
      if (settings.spokenFeedback) {
        speechService.speak(msg, {
          rate: settings.speechRate,
          lang: settings.speechLanguage,
        });
      }
    } else {
      const firstErr = Object.values(errors)[0] || 'Please correct the errors in the form.';
      announce(`Validation error: ${firstErr}`);
      if (settings.spokenFeedback) {
        speechService.speak(`Please correct highlighted fields before reviewing.`, {
          rate: settings.speechRate,
          lang: settings.speechLanguage,
        });
      }
    }
  };

  const handleReadSummary = () => {
    const summary = `Form Review: Full Name: ${formData.fullName}. Phone: ${formData.phone}. Email: ${formData.email || 'Not provided'}. Service requested: ${formData.serviceType}. Preferred contact: ${formData.preferredContact}. Comments: ${formData.comments || 'None'}.`;
    announce('Reading form review summary');
    speechService.speak(summary, {
      rate: settings.speechRate,
      lang: settings.speechLanguage,
    });
  };

  const handleExportPDF = () => {
    try {
      const summaryPayload = {
        'Full Name': formData.fullName,
        'Phone Number': formData.phone,
        'Email Address': formData.email || 'N/A',
        'Requested Service': formData.serviceType,
        'Preferred Contact Method': formData.preferredContact,
        'Additional Comments / Accommodations': formData.comments || 'None',
      };

      const fileName = generateFormPDF(summaryPayload, 'Accessibility Assistance Request Form');
      const msg = `PDF document exported successfully as ${fileName}. Saved to your downloads folder.`;
      setExportSuccess(msg);
      announce(msg);
      if (settings.spokenFeedback) {
        speechService.speak(msg, {
          rate: settings.speechRate,
          lang: settings.speechLanguage,
        });
      }
    } catch (err) {
      const msg = `Could not generate PDF: ${err.message}`;
      announce(msg);
    }
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setReviewMode(false);
    setShowClearConfirm(false);
    setExportSuccess('');
    announce('Form has been cleared.');
  };

  return (
    <div className="form-assistant-page">
      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: '8px' }}>
        Form Assistant (Accessible Entry & Export)
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: 'var(--font-lg)' }}>
        Complete basic forms with guided spoken labels, voice dictation, input validation, and PDF export.
      </p>

      {exportSuccess && (
        <section className="callout callout-success" role="status" aria-live="polite">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={24} aria-hidden="true" />
            <div>{exportSuccess}</div>
          </div>
        </section>
      )}

      {/* Clear Confirmation Modal / Banner */}
      {showClearConfirm && (
        <section className="callout callout-warning" role="alertdialog" aria-labelledby="clear-form-heading">
          <h2 id="clear-form-heading" style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>
            Are you sure you want to clear this entire form?
          </h2>
          <p style={{ marginBottom: '14px' }}>
            All entered information will be erased. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <AccessibleButton
              onClick={handleResetForm}
              variant="danger"
              ariaLabel="Confirm clear form"
            >
              Yes, Clear Everything
            </AccessibleButton>
            <AccessibleButton
              onClick={() => setShowClearConfirm(false)}
              variant="secondary"
              ariaLabel="Cancel clear form"
            >
              Cancel
            </AccessibleButton>
          </div>
        </section>
      )}

      {/* FORM FILLING MODE */}
      {!reviewMode ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProceedToReview();
          }}
          noValidate
          style={{ maxWidth: '780px' }}
        >
          {/* Field 1: Full Name */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="fullName" className="form-label">
                Full Name <span aria-hidden="true" style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AccessibleButton
                  onClick={() => handleReadInstruction('fullName', 'Full Name', 'Enter your official first and last name')}
                  variant="secondary"
                  ariaLabel="Read instructions for Full Name field"
                >
                  Read Field
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => handleVoiceInput('fullName', 'Full Name')}
                  variant={activeVoiceField === 'fullName' ? 'mic-active' : 'secondary'}
                  icon={Mic}
                  ariaLabel="Speak your answer for Full Name field"
                >
                  {activeVoiceField === 'fullName' ? 'Listening...' : 'Voice Dictate'}
                </AccessibleButton>
              </div>
            </div>
            <input
              id="fullName"
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <span id="fullName-error" className="form-error-msg">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Field 2: Phone Number */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="phone" className="form-label">
                Phone Number <span aria-hidden="true" style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AccessibleButton
                  onClick={() => handleReadInstruction('phone', 'Phone Number', 'Enter a 10-digit telephone or mobile number')}
                  variant="secondary"
                  ariaLabel="Read instructions for Phone Number field"
                >
                  Read Field
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => handleVoiceInput('phone', 'Phone Number')}
                  variant={activeVoiceField === 'phone' ? 'mic-active' : 'secondary'}
                  icon={Mic}
                  ariaLabel="Speak your answer for Phone Number field"
                >
                  {activeVoiceField === 'phone' ? 'Listening...' : 'Voice Dictate'}
                </AccessibleButton>
              </div>
            </div>
            <input
              id="phone"
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 555-0199"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className="form-error-msg">
                {errors.phone}
              </span>
            )}
          </div>

          {/* Field 3: Email */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="email" className="form-label">
                Email Address (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AccessibleButton
                  onClick={() => handleReadInstruction('email', 'Email Address', 'Enter an optional email contact address')}
                  variant="secondary"
                  ariaLabel="Read instructions for Email Address field"
                >
                  Read Field
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => handleVoiceInput('email', 'Email Address')}
                  variant={activeVoiceField === 'email' ? 'mic-active' : 'secondary'}
                  icon={Mic}
                  ariaLabel="Speak your answer for Email Address field"
                >
                  {activeVoiceField === 'email' ? 'Listening...' : 'Voice Dictate'}
                </AccessibleButton>
              </div>
            </div>
            <input
              id="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. alex@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="form-error-msg">
                {errors.email}
              </span>
            )}
          </div>

          {/* Field 4: Service Type */}
          <div className="form-group">
            <label htmlFor="serviceType" className="form-label">
              Requested Accessibility Service
            </label>
            <select
              id="serviceType"
              className="form-select"
              value={formData.serviceType}
              onChange={(e) => handleChange('serviceType', e.target.value)}
            >
              <option value="Reading Assistance">Reading Assistance</option>
              <option value="Form Completion Assistance">Form Completion Assistance</option>
              <option value="Document OCR Verification">Document OCR Verification</option>
              <option value="Voice Navigation Training">Voice Navigation Training</option>
            </select>
          </div>

          {/* Field 5: Contact Preference */}
          <div className="form-group">
            <label htmlFor="preferredContact" className="form-label">
              Preferred Contact Channel
            </label>
            <select
              id="preferredContact"
              className="form-select"
              value={formData.preferredContact}
              onChange={(e) => handleChange('preferredContact', e.target.value)}
            >
              <option value="Phone Call">Phone Call</option>
              <option value="SMS / Text">SMS / Text</option>
              <option value="Email">Email</option>
            </select>
          </div>

          {/* Field 6: Comments */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="comments" className="form-label">
                Additional Comments / Accessibility Accommodations
              </label>
              <AccessibleButton
                onClick={() => handleVoiceInput('comments', 'Additional Comments')}
                variant={activeVoiceField === 'comments' ? 'mic-active' : 'secondary'}
                icon={Mic}
                ariaLabel="Speak your answer for comments field"
              >
                {activeVoiceField === 'comments' ? 'Listening...' : 'Voice Dictate'}
              </AccessibleButton>
            </div>
            <textarea
              id="comments"
              className="form-textarea"
              rows={4}
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Mention any specific formats or details you need..."
            />
          </div>

          {/* Form Action Controls */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
            <AccessibleButton
              type="submit"
              variant="primary"
              icon={FileCheck}
              ariaLabel="Review entered form answers"
            >
              Review Answers
            </AccessibleButton>

            <AccessibleButton
              onClick={() => setShowClearConfirm(true)}
              variant="secondary"
              icon={Trash2}
              ariaLabel="Clear form answers"
            >
              Clear Form
            </AccessibleButton>
          </div>
        </form>
      ) : (
        /* REVIEW & EXPORT MODE */
        <section aria-labelledby="review-heading" style={{ maxWidth: '780px' }}>
          <div className="callout callout-success" style={{ margin: 0, marginBottom: '24px' }}>
            <h2 id="review-heading" style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>
              Review Your Answers
            </h2>
            <p>
              Please verify your answers below before generating your downloadable PDF. You can edit any answer or listen to a summary.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <strong>Full Name:</strong> <span>{formData.fullName}</span>
            </div>
            <div>
              <strong>Phone Number:</strong> <span>{formData.phone}</span>
            </div>
            <div>
              <strong>Email Address:</strong> <span>{formData.email || '(None provided)'}</span>
            </div>
            <div>
              <strong>Requested Service:</strong> <span>{formData.serviceType}</span>
            </div>
            <div>
              <strong>Preferred Contact:</strong> <span>{formData.preferredContact}</span>
            </div>
            <div>
              <strong>Comments:</strong> <span>{formData.comments || '(None)'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
            <AccessibleButton
              onClick={handleExportPDF}
              variant="primary"
              icon={Download}
              ariaLabel="Export completed answers as downloadable PDF"
            >
              Export as PDF
            </AccessibleButton>

            <AccessibleButton
              onClick={handleReadSummary}
              variant="secondary"
              ariaLabel="Read form summary aloud"
            >
              Read Summary Aloud
            </AccessibleButton>

            <AccessibleButton
              onClick={() => setReviewMode(false)}
              variant="secondary"
              ariaLabel="Edit form answers"
            >
              Edit Answers
            </AccessibleButton>

            <AccessibleButton
              onClick={() => setShowClearConfirm(true)}
              variant="danger"
              icon={Trash2}
              ariaLabel="Clear and start new form"
            >
              Clear Form
            </AccessibleButton>
          </div>
        </section>
      )}
    </div>
  );
}
