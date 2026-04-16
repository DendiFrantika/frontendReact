import React from 'react';
import { ClinicHeader } from '../../components/ClinicHeader';
import { ClinicHero } from '../../components/ClinicHero';
import { ClinicServices } from '../../components/ClinicServices';
import { ClinicDoctors } from '../../components/ClinicDoctors';
import { ClinicRegistration } from '../../components/ClinicRegistration';
import { ClinicContact } from '../../components/ClinicContact';
import { ClinicFooter } from '../../components/ClinicFooter';

export default function Home() {
  return (
    <div className="w-full bg-white">
      <ClinicHeader />
      <ClinicHero />
      <ClinicServices />
      <ClinicDoctors />
      <ClinicRegistration />
      <ClinicContact />
      <ClinicFooter />
    </div>
  );
}
