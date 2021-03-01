const tumblr = require('tumblr.js');
const request = require('request-promise');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const { exec } = require('shelljs');
const { glob } = require('glob');

const EN_VOICES = [
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-A',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-F',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
];

const VOICES = [
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Wavenet-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['cs-CZ'],
    name: 'cs-CZ-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['da-DK'],
    name: 'da-DK-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Wavenet-E',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['el-GR'],
    name: 'el-GR-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-A',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-F',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fi-FI'],
    name: 'fi-FI-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['hu-HU'],
    name: 'hu-HU-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Wavenet-B',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Wavenet-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-no-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Wavenet-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Wavenet-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Wavenet-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Wavenet-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-BR'],
    name: 'pt-BR-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Wavenet-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Wavenet-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['sk-SK'],
    name: 'sk-SK-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['sv-SE'],
    name: 'sv-SE-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Wavenet-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Wavenet-E',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['uk-UA'],
    name: 'uk-UA-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['es-ES'],
    name: 'es-ES-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Standard-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ar-XA'],
    name: 'ar-XA-Standard-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['ru-RU'],
    name: 'ru-RU-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },

  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Standard-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Standard-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nl-NL'],
    name: 'nl-NL-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['cs-CZ'],
    name: 'cs-CZ-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['el-GR'],
    name: 'el-GR-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['pt-BR'],
    name: 'pt-BR-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['hu-HU'],
    name: 'hu-HU-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Standard-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pl-PL'],
    name: 'pl-PL-Standard-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['sk-SK'],
    name: 'sk-SK-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Standard-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['tr-TR'],
    name: 'tr-TR-Standard-E',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['uk-UA'],
    name: 'uk-UA-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['da-DK'],
    name: 'da-DK-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fi-FI'],
    name: 'fi-FI-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Standard-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['pt-PT'],
    name: 'pt-PT-Standard-D',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-no-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['nb-NO'],
    name: 'nb-NO-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['sv-SE'],
    name: 'sv-SE-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 22050,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['de-DE'],
    name: 'de-DE-Standard-E',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-CA'],
    name: 'fr-CA-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['fr-FR'],
    name: 'fr-FR-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Standard-B',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Standard-C',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['it-IT'],
    name: 'it-IT-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
];

class FieriFiction {
  constructor({
    tumblrConsumerKey = null,
    tumblrConsumerSecret = null,
    tumblrTokenKey = null,
    tumblrTokenSecret = null,
    tumblrBlogName = null,
    textGeneratorUrl = null,
    audioGeneratorUrl = null,
    googleCloudCredentials = null,
    music = '*.mp3',
    textLength = 100,
    topK = 40,
    temperature = 1,
    speakingRate = 1,
    pitch = 0,
  } = {}) {
    this.client = tumblr.createClient({
      token: tumblrTokenKey,
      token_secret: tumblrTokenSecret,
      consumer_key: tumblrConsumerKey,
      consumer_secret: tumblrConsumerSecret,
      returnPromises: true,
    });

    this.blogName = tumblrBlogName;
    this.textGeneratorUrl = textGeneratorUrl;
    this.audioGeneratorUrl = audioGeneratorUrl;
    this.textLength = textLength;
    this.speakingRate = speakingRate;
    this.pitch = pitch;
    this.music = music;
    this.topK = topK;
    this.temperature = temperature;
    this.googleCloudCredentials = googleCloudCredentials;
    this.loops = glob.sync(`${__dirname}/loops/${this.music}`);
  }

  captionsToString(captions) {
    return captions
      .join(' ')
      .replace(/\\n/gi, ' ')
      .replace(/\s{2,}/, ' ');
  }

  getFullSentences(string) {
    const match = string.match(/[.!?]/gi);
    const lastIndex = string.lastIndexOf(match[match.length - 1]);
    return string.slice(0, lastIndex + 1);
  }

  closeQuotes(string) {
    const count = (string.match(/\"/g) || []).length;
    return count === 0 || count % 2 === 0
      ? string
      : string.replace(/([.!?])$/, '"$1');
  }

  execCmd(cmd) {
    const result = exec(cmd, { silent: true });
    if (result.code !== 0) {
      console.error(`🐞 Oops: ${result.stderr}\n> ${cmd}`);
    }
    return result;
  }

  getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getVideoLength(file) {
    const output = this.execCmd(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    return output.trim();
  }

  isGif(file) {
    return file.endsWith('.gif');
  }

  addSoundtrack(image, video, loop = null) {
    const useLoop = loop || this.getRandom(this.loops);
    const trim = this.isGif(image) ? 3 : 1;
    console.log(`\n🎷 Adding music: ${useLoop}`);
    const len = Math.floor(this.getVideoLength(video) - trim);
    const cmd = `ffmpeg -i "${video}" -filter_complex "amovie='${useLoop}':loop=999,loudnorm[s];[0][s]amix=duration=shortest" -t ${len} -y "${video}-temp.mp4" && rm "${video}" && mv "${video}-temp.mp4" "${video}"`;

    this.execCmd(cmd);
  }

  createVideo(image, audio, output) {
    console.log('\n📽️  Generating video');

    const loop = this.isGif(image) ? '-ignore_loop 0' : '-loop 1';

    return this.execCmd(
      `ffmpeg -i "${audio}" ${loop} -i "${image}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -shortest -strict -2 -c:v libx264 -threads 4 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y -af extrastereo,lowpass=3000,highpass=200,alimiter "${output}"`
    );
  }

  getImage(images) {
    if (images.length === 1) {
      return images[0];
    }
    const firstImage = images[0];
    const escapedFilenames = images.map((image) => `"${image}"`);

    if (this.isGif(firstImage)) {
      const combinedFileName = `${firstImage}-combined.gif`;
      this.execCmd(
        `convert ${escapedFilenames.join(' ')} "${combinedFileName}"`
      );
      return combinedFileName;
    }

    const combinedFileName = `${firstImage}-combined.png`;
    this.execCmd(
      `convert ${escapedFilenames.join(' ')} -append "${combinedFileName}"`
    );
    return combinedFileName;
  }

  async reblogPost(text, postId, blogName, tags = []) {
    console.log('\n🔄 Reblogging text post');
    const postInfo = await this.client.blogPosts(blogName, {
      id: postId,
    });
    const reblogKey = postInfo.posts[0].reblog_key;
    const response = await this.client.reblogPost(this.blogName, {
      id: postId,
      tags: tags.join(','),
      reblog_key: reblogKey,
      comment: text,
    });
    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${response.id}`
    );
    return response;
  }

  // I truly hate Google Cloud's dependency on authentication files
  execAuthGcloudCmd(cmd) {
    if (!this.googleCloudCredentials) {
      return this.execCmd(cmd).trim();
    }
    const tmpFile = '.creds.json';
    writeFileSync(tmpFile, this.googleCloudCredentials);
    const result = this.execCmd(
      `GOOGLE_APPLICATION_CREDENTIALS=${tmpFile} ${cmd}`
    ).trim();
    unlinkSync(tmpFile);
    return result;
  }

  async textToSpeech(text, output) {
    console.log('\n🕋 Synthesizing');

    const token = this.execAuthGcloudCmd(
      'gcloud auth application-default print-access-token'
    );

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    };

    const { languageCodes, ssmlGender, name } = this.getRandom(EN_VOICES);

    const paramVoice = {
      ssmlGender,
      name,
      languageCode: languageCodes[0],
    };

    const dataString = JSON.stringify({
      input: {
        text,
      },
      voice: paramVoice,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: this.speakingRate,
        pitch: this.pitch,
      },
    });

    const options = {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      method: 'POST',
      headers: headers,
      body: dataString,
    };

    try {
      const response = await request(options);
      const audioContent = JSON.parse(response).audioContent;
      const buffer = Buffer.from(audioContent, 'base64');
      writeFileSync(output, buffer);
    } catch (err) {
      console.error(`💥 Could not save mp3 (with token: ${token}):`, err);
    }
  }

  async generateStory(captions) {
    const params = {
      length: this.textLength,
      top_k: this.topK,
      temperature: this.temperature,
    };
    console.log(`\n💭 Talking to Dreamscape (${JSON.stringify(params)})`);
    const input = this.captionsToString(captions);
    const req = await request({
      uri: this.textGeneratorUrl,
      qs: {
        q: input,
        ...params,
      },
      json: true,
    });
    if (!req || !req.output) {
      return null;
    }
    return this.closeQuotes(this.getFullSentences(req.output));
  }

  async generateAndShareVideo(story, image, tags, sourceUrl) {
    const mp3 = `${image}.mp3`;
    const mp4 = `${image}.mp4`;

    await this.textToSpeech(story, mp3);
    this.createVideo(image, mp3, mp4);
    this.addSoundtrack(image, mp4);

    const video = readFileSync(mp4);
    const videoPost = await this.client.createVideoPost(this.blogName, {
      data64: video.toString('base64'),
      tags: tags.join(','),
      caption: story,
      source_url: sourceUrl,
    });

    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${videoPost.id}`
    );
    console.log('👋 Wrapping up!');
    unlinkSync(mp3);
    unlinkSync(mp4);
  }

  async postVideo(
    images,
    captions,
    tags = [],
    sourceUrl = null,
    reblogInfo = null,
    useStory = false
  ) {
    const image = this.getImage(images);
    let story = useStory ? captions.join(' ') : null;
    try {
      if (!story) {
        story = await this.generateStory(captions);
        if (!story || story.length === 0) {
          console.error('💥 Got no story, so leaving');
          process.exit(0);
        }
      }
      await this.generateAndShareVideo(story, image, tags, sourceUrl);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
      if (reblogInfo && story) {
        console.warn(`💥 Trying to reblog instead as a last-ditch effort`);
        await this.reblogPost(
          story,
          reblogInfo.postId,
          reblogInfo.blogName,
          tags
        );
      }
    }
  }

  async postText(captions, postId, blogName, tags = [], useStory = false) {
    try {
      const story = useStory
        ? captions.join(' ')
        : await this.generateStory(captions);
      await this.reblogPost(story, postId, blogName, tags);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
    }
  }
}

module.exports = FieriFiction;
