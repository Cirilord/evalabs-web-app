import { WorkflowBoardPageView } from './components/WorkflowBoardPageView';
import { type EditWorkflowPageProps } from './types';

export default async function EditWorkflowPage(props: EditWorkflowPageProps) {
  const { params } = props;
  const { workflowId } = await params;

  return <WorkflowBoardPageView workflowId={workflowId} />;
}
