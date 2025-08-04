function checkIfAllSubmitted(isFullForm) {
    Count++;
    /*if (isFullForm) {

        if (confirmCount === confirmTotal) {
            const confirmTitle = document.getElementById('coords-confirm-title');
            if (confirmTitle) confirmTitle.remove();
        }
    } else {
        if (fixCount === fixTotal) {
            const fixTitle = document.getElementById('bad-address-title');
            if (fixTitle) fixTitle.remove();
        }
    }*/

    if (fixCount === Total) {
        document.getElementById('warninfo').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'block';
        const fixTitle = document.getElementById('bad-address-title');
            if (fixTitle) fixTitle.remove();
        const confirmTitle = document.getElementById('coords-confirm-title');
            if (confirmTitle) confirmTitle.remove();
    }
}

