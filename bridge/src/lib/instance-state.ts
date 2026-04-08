let activeInstanceId: string | null = null;

export function setActiveInstanceId(instanceId: string | null) {
  activeInstanceId = instanceId;
}

export function getActiveInstanceId() {
  return activeInstanceId;
}
