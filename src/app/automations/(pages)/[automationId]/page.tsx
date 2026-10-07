import { AutomationDetailsPageView } from './components/AutomationDetailsPageView';
import { type AutomationDetailsPageProps } from './types';

export default async function AutomationDetailsPage(props: AutomationDetailsPageProps) {
  const { params } = props;
  const { automationId } = await params;

  return <AutomationDetailsPageView automationId={automationId} />;
}
