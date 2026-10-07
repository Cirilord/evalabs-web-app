import { WorkflowDetailsPageView } from './components/WorkflowDetailsPageView';
import { type WorkflowDetailsPageProps } from './types';

export default async function WorkflowDetailsPage(props: WorkflowDetailsPageProps) {
  const { params } = props;
  const { workflowId } = await params;

  return <WorkflowDetailsPageView workflowId={workflowId} />;
}
