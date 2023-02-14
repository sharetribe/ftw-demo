import React from 'react';
import { ExternalLink } from '../../components';
import PageBuilder from '../PageBuilder/PageBuilder';
import css from './FallbackPage.module.css';

// Create fallback content (array of sections) in page asset format:
export const fallbackSections = {
  sections: [
    {
      sectionType: 'customMaintenance',
      sectionId: 'maintenance-mode',
    },
  ],
  meta: {
    pageTitle: {
      fieldType: 'metaTitle',
      content: 'Home page',
    },
    pageDescription: {
      fieldType: 'metaDescription',
      content: 'Home page fetch failed',
    },
  },
};

// Note: this microcopy/translation does not come from translation file.
//       It needs to be something that is not part of fetched assets but built-in text
const SectionMaintenanceMode = props => {
  const { sectionId } = props;

  return (
    <section id={sectionId} className={css.root}>
      <div className={css.content}>
        <h1>You need to add a landing page to your demo marketplace </h1>
        <p>
          The landing page of your Flex Demo Marketplace is now powered by Pages, which allows you
          to manage your static content pages without coding in Console. To refresh your Demo
          Marketplace, you need to go to Pages in your Flex Console and click the button “Import
          default pages”. You can then make adjustments to your Demo Marketplace and see how they
          look on the page.
        </p>
        <p>
          <ExternalLink href="https://flex-console.sharetribe.com/a/content/pages">
            Go to Pages in Console
          </ExternalLink>
        </p>
      </div>
    </section>
  );
};

// This is the fallback page, in case there's no Landing Page asset defined in Console.
const FallbackPage = props => {
  return (
    <PageBuilder
      pageAssetsData={fallbackSections}
      options={{
        sectionComponents: {
          customMaintenance: { component: SectionMaintenanceMode },
        },
      }}
      {...props}
    />
  );
};

export default FallbackPage;
