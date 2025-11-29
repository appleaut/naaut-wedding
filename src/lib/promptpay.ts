
function crc16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTarget(target: string): string {
    if (!target) return '';
    const cleanTarget = target.replace(/[^0-9]/g, '');
    if (cleanTarget.length === 13) {
        return cleanTarget;
    } else if (cleanTarget.length === 10) {
        return '0066' + cleanTarget.substring(1);
    } else if (cleanTarget.length >= 15) {
        return cleanTarget;
    }
    // Fallback or error? For now return as is if it looks somewhat valid, or empty
    return cleanTarget;
}

function f(id: string, value: string): string {
    return id + value.length.toString().padStart(2, '0') + value;
}

export function generatePayload(target: string, amount?: number): string {
    const targetId = formatTarget(target);
    if (!targetId) return '';

    const merchantInfo = [
        f('00', 'A000000677010111'),
        f('01', targetId)
    ].join('');

    let payload = [
        f('00', '01'),
        f('01', amount ? '11' : '12'),
        f('29', merchantInfo),
        f('58', 'TH'),
        f('53', '764'),
    ];

    if (amount) {
        payload.push(f('54', amount.toFixed(2)));
    }

    const data = payload.join('') + '6304';
    const crcValue = crc16(data);
    return data + crcValue;
}
