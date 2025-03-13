export function transformThinkBlocks(text) {
    // Заменяем <think> на <span class="hidden-think"> и </think> на </span>
    let replaced = text.replace(/<think>/g, '<span class="hidden-think">');
    replaced = replaced.replace(/<\/think>/g, '</span>');
    return replaced;
}
