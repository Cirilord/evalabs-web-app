import { EditAutomationPageView } from './components/EditAutomationPageView';
import { type EditAutomationPageProps } from './types';

export default async function EditAutomationPage(props: EditAutomationPageProps) {
  const { params } = props;
  const { automationId } = await params;

  return <EditAutomationPageView automationId={automationId} />;
}
