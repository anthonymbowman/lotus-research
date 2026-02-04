import { TermDefinition } from './TermDefinition';
import { ProtocolExplainer, LotusSolution } from './ProtocolExplainer';
import { PageHeader } from './PageHeader';
import { AppCTA } from './AppCTA';
import { content } from '../content';

const { intro } = content;

export function Introduction() {
  return (
    <div className="space-y-8">
      <PageHeader
        whatYoullLearn={intro.pageHeader.whatYoullLearn}
        tryThis={intro.pageHeader.tryThis}
      />

      {/* Interactive Protocol Explainer */}
      <ProtocolExplainer />

      {/* The Lotus Solution */}
      <LotusSolution />

      {/* The Lotus Difference */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-6 border border-lotus-purple-700/50">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          {intro.lotusDifference.heading}
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">{intro.lotusDifference.features[0].title}</span>
              <span className="text-lotus-grey-300"> — Lenders choose their risk exposure across <TermDefinition term="tranche-seniority">senior and junior tranches</TermDefinition>.</span>
              <div className="text-sm text-lotus-grey-300 mt-2">
                <span className="font-medium text-lotus-grey-200">Lenders:</span> {intro.lotusDifference.features[0].lenderNote}
              </div>
              <div className="text-sm text-lotus-grey-300 mt-1">
                <span className="font-medium text-lotus-grey-200">Borrowers:</span> {intro.lotusDifference.features[0].borrowerNote}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">
                <TermDefinition term="connected-liquidity">{intro.lotusDifference.features[1].title}</TermDefinition>
              </span>
              <span className="text-lotus-grey-300"> — {intro.lotusDifference.features[1].description}</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">
                <TermDefinition term="productive-debt">{intro.lotusDifference.features[2].title}</TermDefinition>
              </span>
              <span className="text-lotus-grey-300"> — {intro.lotusDifference.features[2].description.split('spreads')[0]}<TermDefinition term="borrow-lend-spread">spreads</TermDefinition>{intro.lotusDifference.features[2].description.split('spreads')[1]}</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Vault Mention */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-lotus-grey-100 mb-1">{intro.vaultsPreview.heading}</h3>
            <p className="text-sm text-lotus-grey-200">
              {intro.vaultsPreview.description}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <AppCTA context="intro" />
    </div>
  );
}

export default Introduction;
